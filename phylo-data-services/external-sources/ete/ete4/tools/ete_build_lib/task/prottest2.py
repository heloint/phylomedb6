import os
import re
import logging

log = logging.getLogger("main")

from ..master_task import ModelTesterTask
from ..master_job import Job
from ..utils import basename, PhyloTree, GLOBALS

__all__ = ["Prottest"]


class Prottest(ModelTesterTask):
    def __init__(self, nodeid, alg_fasta_file, alg_phylip_file, constrain_tree, conf):
        self.alg_phylip_file = alg_phylip_file
        self.alg_fasta_file = alg_fasta_file
        self.alg_basename = basename(self.alg_phylip_file)
        self.conf = conf
        self.lk_mode = self.conf["prottest"]["_lk_mode"]
        if self.lk_mode == "raxml":
            phyml_optimization = "n"
        elif self.lk_mode == "phyml":
            phyml_optimization = "lr"
        else:
            raise ValueError("Choose a valid lk_mode value (raxml or phyml)")

        base_args = {
            "--datatype": "aa",
            "--input": self.alg_basename,
            "--bootstrap": "0",
            "-o": phyml_optimization,
            "--model": None,  # I will iterate over this value when
            # creating jobs
            "--quiet": "",
        }

        ModelTesterTask.__init__(
            self, nodeid, "mchooser", "Prottest", base_args, conf["prottest"]
        )

        self.best_model = None
        self.seqtype = "aa"
        self.models = self.conf["prottest"]["_models"]
        self.init()
        self.post_init()

    def post_init(self):
        self.best_model_file = os.path.join(self.taskdir, "best_model.txt")
        self.tree_file = None  # os.path.join(self.taskdir, "final_tree.nw")

        # Phyml cannot write the output in a different directory that
        # the original alg file. So I use relative path to alg file
        # for processes and I create a symlink for each of the
        # instances.
        for job in self.jobs:
            fake_alg_file = os.path.join(job.jobdir, self.alg_basename)
            if os.path.exists(fake_alg_file):
                os.remove(fake_alg_file)
            try:  # Does not work on windows
                os.symlink(self.alg_phylip_file, fake_alg_file)
            except OSError:
                log.warning(
                    "Unable to create symbolic links. Duplicating files instead"
                )
                shutil.copy(self.alg_phylip_file, fake_alg_file)

    def load_jobs(self):
        for m in self.models:
            args = self.args.copy()
            args["--model"] = m
            job = Job(
                self.conf["app"]["phyml"],
                args,
                parent_ids=[self.nodeid],
                jobname="phyml-bionj",
            )
            job.flag = "phyml"
            self.jobs.append(job)

            if self.lk_mode == "raxml":
                raxml_args = {
                    "-f": "e",
                    "-s": self.alg_basename,
                    "-m": "PROTGAMMA%s" % m,
                    "-n": self.alg_basename + "." + m,
                    "-t": os.path.join(
                        GLOBALS["tasks_dir"],
                        job.jobid,
                        self.alg_basename + "_phyml_tree.txt",
                    ),
                }
                raxml_job = Job(
                    self.conf["app"]["raxml"],
                    raxml_args,
                    parent_ids=[job.jobid],
                    jobname="raxml-tree-optimize",
                )
                raxml_job.dependencies.add(job)
                raxml_job.flag = "raxml"
                raxml_job.model = m
                self.jobs.append(raxml_job)

        log.log(26, "Models to test %s", self.models)

    def finish(self):
        lks = []
        if self.lk_mode == "phyml":
            for job in [j for j in self.jobs if j.flag == "phyml"]:
                tree_file = os.path.join(
                    job.jobdir, self.alg_basename + "_phyml_tree.txt"
                )
                stats_file = os.path.join(
                    j.jobdir, self.alg_basename + "_phyml_stats.txt"
                )
                tree = PhyloTree(open(tree_file))
                m = re.search("Log-likelihood:\s+(-?\d+\.\d+)", open(stats_file).read())
                lk = float(m.groups()[0])
                tree.add_property("lk", lk)
                tree.add_property("model", job.args["--model"])
                lks.append([float(tree.lk), tree.model, tree])
        elif self.lk_mode == "raxml":
            for job in [j for j in self.jobs if j.flag == "raxml"]:
                lk = (
                    open(os.path.join(job.jobdir, "RAxML_log.%s" % job.args["-n"]))
                    .readline()
                    .split()[1]
                )
                tree = PhyloTree(job.args["-t"])
                tree.add_property("lk", lk)
                tree.add_property("model", job.model)
                lks.append([lk, tree.model, tree])
        lks.sort()
        lks.reverse()
        # choose the model with higher likelihood
        best_model = lks[-1][1]
        best_tree = lks[-1][2]
        open(self.best_model_file, "w").write(best_model)
        if self.tree_file:
            tree.write(self.tree_file)
        ModelTesterTask.finish(self)
