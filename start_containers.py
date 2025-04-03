#!/usr/bin/env python3

from __future__ import annotations

import sys
import pty
import argparse
import subprocess
from dataclasses import dataclass
from typing import Callable

import configparser


class _HelpAction(argparse._HelpAction):

    def __call__(self, parser, namespace, values, option_string=None):
        parser.print_help()

        # retrieve subparsers from parser
        subparsers_actions = [
            action
            for action in parser._actions
            if isinstance(action, argparse._SubParsersAction)
        ]
        # there will probably only be one subparser_action,
        # but better save than sorry
        for subparsers_action in subparsers_actions:
            # get all subparsers and print help
            for choice, subparser in subparsers_action.choices.items():
                print("Subparser '{}'".format(choice))
                print(subparser.format_help())

        parser.exit()


class Helpers:
    @staticmethod
    def exec_shell_cmd_live(cmd: subprocess._CMD) -> None:
        """
        Runs a shell command and prints output in real-time.
        Raises ChildProcessError if the command fails.

        Args:
            cmd (list): The shell command as a list of arguments.

        Raises:
            ChildProcessError: If the command exits with a non-zero status.
        """
        process = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
        )
        if process.stdout is not None:
            for line in iter(process.stdout.readline, ""):
                line = f"{line.strip()}\n"
                if line:
                    print(line, end="")
        process.wait()
        if process.returncode != 0:
            raise ChildProcessError(
                f"Command '{cmd}' failed with exit code {process.returncode}"
            )

    @staticmethod
    def validate_env_file(env_file_path: str) -> None:
        required_vars = (
            "NEXT_PUBLIC_BASE_URL",
            "DB_USER",
            "DB_PASS",
            "DB_HOST",
            "DB_PORT",
            "DB_DATABASE",
            "CLUSTER_USER",
            "CLUSTER_HOST",
            "CLUSTER_PASS",
            "CLUSTER_BLAST_DB_PATH",
            "CLUSTER_TRANFER_HOST",
            "EMAIL_USER",
            "EMAIL_PASS",
            "EMAIL_USER_ADMIN",
            "FULLNAME_USER_ADMIN",
        )
        with open(env_file_path, "r", encoding="UTF-8") as file:
            lines: tuple[str, ...] = tuple(map(str.strip, file.readlines()))

        variable_names = [line.split("=")[0].strip() for line in lines]
        for name in required_vars:
            if name not in variable_names:
                raise ValueError(
                    f"Environment variable '{name}' is missing from '{env_file_path}' .env file."
                )

    @classmethod
    def exec_shell_cmd(cls, cmd: str) -> str:
        exit_code, output = subprocess.getstatusoutput(cmd)
        if exit_code != 0:
            raise ChildProcessError(output)
        return output

    @classmethod
    def get_env_file_from_existing_containers(cls) -> str:
        cmd = "docker container ls -a | awk '$NF ~ /^phylomedb6-/ {print $NF}' | xargs -I {} docker inspect {} | grep \"environment_file\" | awk -F\":\" '{print $NF}' | sed 's/[\",]*//g' | sort | uniq"
        output = cls.exec_shell_cmd(cmd)
        output_lines = output.strip().splitlines(keepends=False)
        env_files_count: int = len(output_lines)
        if env_files_count != 1:
            raise ValueError(
                "Mixed environment files are used in the container cluster. Would be suggested to remove all of the containers by force and restart them from zero."
            )
        return output_lines[0]


@dataclass
class DeploymentConfig:
    def __init__(self, args: argparse.Namespace) -> None:
        self._config_file_content = configparser.ConfigParser()
        self._config_file_content.read(args.config_file)
        self._deployment_type = "production"

        if (
            hasattr(args, "dev")
            and hasattr(args, "local_production")
            and args.dev
            and args.local_production
        ):
            raise ValueError(
                "--dev and --local-production flags cannot be used together."
            )
        elif hasattr(args, "dev") and args.dev:
            self._deployment_type = "development"

        self.env_file = self._config_file_content[self._deployment_type]["env_file"]
        self.docker_compose_profile = self._config_file_content[self._deployment_type][
            "docker_compose_profile"
        ]
        if hasattr(args, "local_production") and args.local_production:
            self._deployment_type = "production"
            self.docker_compose_profile = self._config_file_content["development"][
                "docker_compose_profile"
            ]


class StartupActionHandler:
    def __init__(
        self, args: argparse.Namespace, startup_config: DeploymentConfig | None
    ) -> None:
        self._args = args
        self._action_type = args.startup_action
        self._handlers: dict[str, Callable[...]] = {
            "stop": self._handle_stop,
            "start": self._handle_start,
            "restart": self._handle_restart,
            "remove": self._handle_remove,
        }
        self.config = startup_config

    def __call__(self) -> None:
        self._handlers[self._action_type]()

    def _create_shared_node_modules(self) -> None:
        """
        This is a hack to create the "node_modules" directory inside a
        temporary container, then copy it back to host. This will ensure
        that the editor's LSP will recognize correctly the dependencies from
        outside the container for the time of the development.
        """

        if self.config is None:
            raise ValueError(
                "Configuration is not parsed, because not required in current context."
            )
        # Build the Docker image using docker-compose
        subprocess.run(
            [
                "docker",
                "compose",
                "--env-file",
                self.config.env_file,
                "-f",
                "docker-compose.yml",
                "build",
            ],
            check=True,
        )

        # Remove existing node_modules directory
        subprocess.run(["rm", "-rf", "./phylomedb6-webapp/node_modules"], check=True)

        # Create a temporary container from the Docker image
        img_id = subprocess.run(
            ["docker", "create", "phylomedb6-app-cluster-phylomedb6-webapp:latest"],
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()

        # Copy node_modules from the container to the local directory
        subprocess.run(
            [
                "docker",
                "cp",
                f"{img_id}:/phylomedb6-webapp/node_modules",
                "./phylomedb6-webapp/node_modules",
            ],
            check=True,
        )

        # Stop and remove the container
        subprocess.run(["docker", "container", "stop", img_id], check=True)
        subprocess.run(["docker", "container", "rm", img_id], check=True)

        print("==> Build completed and node_modules copied successfully!")

    def _handle_stop(self) -> None:
        if self.config is None:
            raise ValueError(
                "Configuration is not parsed, because not required in current context."
            )
        env_file = Helpers.get_env_file_from_existing_containers()
        cmd = (
            "docker",
            "compose",
            "-f",
            "docker-compose.yml",
            "--env-file",
            env_file,
            "--profile",
            self.config.docker_compose_profile,
            "stop",
        )
        Helpers.exec_shell_cmd_live(cmd)

    def _handle_start(self) -> None:
        if self.config is None:
            raise ValueError(
                "Configuration is not parsed, because not required in current context."
            )
        self._create_shared_node_modules()
        cmd = (
            "docker",
            "compose",
            "-f",
            "docker-compose.yml",
            "--env-file",
            self.config.env_file,
            "--profile",
            self.config.docker_compose_profile,
            "up",
            "-d",
        )
        Helpers.exec_shell_cmd_live(cmd)

        if self._args.logs:
            logs_cmd = [
                "docker",
                "compose",
                "-f",
                "docker-compose.yml",
                "--env-file",
                self.config.env_file,
            ]
            logs_cmd.extend(["logs", "-f"])
            pty.spawn(logs_cmd)

    def _handle_restart(self) -> None:
        try:
            self._handle_stop()
        except ValueError as e:
            if "Mixed environment files" in str(e) and self._args.dev:
                print(
                    f"[WARNING] Mixed environment files are used "
                    "in the container cluster. "
                    "Running containers will be removed first to be "
                    "able to start the development startup.",
                    file=sys.stderr,
                )
                self._args.hard = True
                self._args.remove_images = False
                self._handle_remove()
            else:
                print(f"[ERROR] {str(e)}", file=sys.stderr)
                raise SystemExit(1)
        self._handle_start()

    def _handle_remove(self) -> None:
        force_flag = ""
        if self._args.hard:
            force_flag = "-f"

        try:
            cmd = (
                f"docker container ls -a"
                " | awk '$NF ~ /^phylomedb6-/ {{print $NF}}'"
                f" | xargs -I {{}} docker rm {force_flag} {{}}"
            )
            output = Helpers.exec_shell_cmd(cmd)
        except ChildProcessError as e:
            if "container is running" in str(e):
                output = str(e).replace("Error response from daemon:", "[Warning] ")
            raise e
        output = output.strip()
        if output:
            print(output)

        if self._args.remove_images:
            try:
                cmd = (
                    f"docker image ls -a"
                    " | awk '$1 ~ /^phylomedb6-/ {{print $1}}'"
                    " | xargs -I {{}} docker image rm -f {{}}"
                )
                output = Helpers.exec_shell_cmd(cmd)
            except ChildProcessError as e:
                if "No such image" in str(e):
                    output = str(e).replace("Error response from daemon:", "[Warning] ")
                    return
                raise e
            output = output.strip()
            if output:
                print(output)


def get_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Start the containers for PhylomeDB6 in production/development environment."
        ),
        add_help=False,
    )
    parser.add_argument(
        "--config-file",
        type=str,
        default="./startup.config.ini",
        help="The path to the configuration file.",
    )
    parser.add_argument(
        "-h", "--help", action=_HelpAction, help="help for help if you need some help"
    )  # add custom help
    subparsers = parser.add_subparsers(
        dest="startup_action",
    )
    subparsers.required = True
    start_parser = subparsers.add_parser(
        "start",
        help=(
            "Starts the build and run for all of the containers."
            "(Production mode by default. For development use the '--dev' flag, for local production use the '--local-production'."
        ),
    )
    start_parser.add_argument(
        "--dev",
        help="Start the application in 'development' mode.",
        action="store_true",
    )
    start_parser.add_argument(
        "--local-production",
        help=(
            "Start the application in 'local-production' mode. "
            "(NOTE: The production environment file must be modified first "
            "similar to the development file.)"
        ),
        action="store_true",
    )
    start_parser.add_argument(
        "--logs",
        help="Show the live logs output of Docker Compose after startup.",
        action="store_true",
    )
    stop_parser = subparsers.add_parser("stop", help="Stops all of the containers.")
    stop_parser.add_argument(
        "--dev",
        help="Stops all the development related containers.",
        action="store_true",
    )
    restart_parser = subparsers.add_parser(
        "restart",
        help=(
            "Force restart all the containers in lazy mode."
            "If they don't exists, it will run the 'start' logic."
            "(To restart everything from zero, use the '--hard' flag."
            "If you want to restart the application directly into development mode,"
            "then use the '--dev' flag."
        ),
    )
    restart_parser.add_argument(
        "--hard",
        help="Restart the application from zero. Removing and rebuilding all images and containers.",
        action="store_true",
    )
    restart_parser.add_argument(
        "--dev",
        help="Restart the application if 'development' mode.",
        action="store_true",
    )
    restart_parser.add_argument(
        "--logs",
        help="Show the live logs output of Docker Compose after startup.",
        action="store_true",
    )
    remove_parser = subparsers.add_parser(
        "remove",
        help=(
            "Removes all the existing, non-running containers."
            "(To remove wheter they are running or not use the '--hard' flag."
            "Also to remove their images with force, use the '--remove-images' flag."
        ),
    )
    remove_parser.add_argument(
        "--remove-images",
        help="Also, remove the corresponding images with force.",
        action="store_true",
    )
    remove_parser.add_argument(
        "--hard",
        help="Removes all existing containers, wheter they are running or not.",
        action="store_true",
    )
    return parser.parse_args()


def cleanup_dangling_volumes_and_images() -> None:
    try:
        cmd = "docker volume rm $(docker volume ls -qf dangling=true)"
        print("==> Cleaning up dangling volumes ...")
        Helpers.exec_shell_cmd(cmd)
    except ChildProcessError as e:
        if "Remove one or more volumes" in str(e):
            pass
        else:
            raise e

    try:
        cmd = 'docker rmi $(docker images -f "dangling=true" -q)'
        print("==> Cleaning up dangling images ...")
        Helpers.exec_shell_cmd(cmd)
    except ChildProcessError as e:
        if '"docker rmi" requires at least 1 argument.' in str(e):
            pass
        else:
            raise e


def main() -> int:
    try:
        args = get_arguments()
        startup_config = None
        if args.startup_action in ("start", "restart", "stop"):
            startup_config = DeploymentConfig(args)
            Helpers.validate_env_file(startup_config.env_file)

        action_handler = StartupActionHandler(args, startup_config)
        action_handler()
    except KeyboardInterrupt:
        print("==> Killing startup ...", file=sys.stderr)
        print(
            "==> Cleaning up dangling volumes and images after interrupted startup ...",
            file=sys.stderr,
        )
        cleanup_dangling_volumes_and_images()
        raise SystemExit(1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
