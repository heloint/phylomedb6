import os
import re
import logging
import shutil

log = logging.getLogger("main")

from ..master_task import ModelTesterTask
from ..master_job import Job
from ..errors import TaskError
from ..utils import basename, PhyloTree, GLOBALS, pjoin

__all__ = ["Prottest"]


class Prottest(ModelTesterTask):
    def __init__(
        self,
        nodeid,
        alg_fasta_file,
        alg_phylip_file,
        constrain_tree,
        seqtype,
        conf,
        confname,
    ):
        GLOBALS["citator"].add("phyml")

        self.alg_phylip_file = alg_phylip_file
        self.alg_fasta_file = alg_fasta_file
        self.confname = confname
        self.conf = conf
        self.lk_mode = conf[confname]["_lk_mode"]
        if self.lk_mode == "raxml":
            phyml_optimization = "n"
        elif self.lk_mode == "phyml":
            phyml_optimization = "lr"
        else:
            raise ValueError("Choose a valid lk_mode value (raxml or phyml)")

        base_args = {
            "--datatype": "aa",
            "--input": self.alg_phylip_file,
            "--bootstrap": "0",
            "-o": phyml_optimization,
            "--model": None,  # I will iterate over this value when
            # creating jobs
            "--quiet": "",
        }
        self.models = conf[confname]["_models"]
        task_name = "Prottest-[%s]" % ",".join(self.models)
        ModelTesterTask.__init__(
            self, nodeid, "mchooser", task_name, base_args, conf[confname]
        )

        if seqtype == "nt":
            log.error("Prottest can only be used with amino-acid alignments!")
            raise TaskError(
                self, "Prottest can only be used with amino-acid alignments!"
            )

        self.best_model = None
        self.seqtype = "aa"
        self.init()

    def load_jobs(self):
        conf = self.conf
        for m in self.models:
            args = self.args.copy()
            args["--model"] = m
            bionj_job = Job(conf["app"]["phyml"], args, parent_ids=[self.nodeid])
            bionj_job.jobname += "-bionj-" + m
            bionj_job.jobcat = "bionj"
            bionj_job.add_input_file(self.alg_phylip_file, bionj_job.jobdir)
            self.jobs.append(bionj_job)

            if self.lk_mode == "raxml":
                raxml_args = {
                    "-f": "e",
                    "-s": pjoin(bionj_job.jobdir, self.alg_phylip_file),
                    "-m": "PROTGAMMA%s" % m,
                    "-n": self.alg_phylip_file + "." + m,
                    "-t": pjoin(
                        bionj_job.jobdir, self.alg_phylip_file + "_phyml_tree.txt"
                    ),
                }
                raxml_job = Job(
                    conf["app"]["raxml"], raxml_args, parent_ids=[bionj_job.jobid]
                )
                raxml_job.jobname += "-lk-optimize"
                raxml_job.dependencies.add(bionj_job)
                raxml_job.model = m
                raxml_job.jobcat = "raxml"
                self.jobs.append(raxml_job)

    def finish(self):
        lks = []
        if self.lk_mode == "phyml":
            for job in self.jobs:
                if job.jobcat != "bionj":
                    continue
                phyml_job = job
                tree_file = pjoin(
                    phyml_job.jobdir, self.alg_phylip_file + "_phyml_tree.txt"
                )
                stats_file = pjoin(
                    phyml_job.jobdir, self.alg_phylip_file + "_phyml_stats.txt"
                )
                tree = PhyloTree(open(tree_file))
                m = re.search("Log-likelihood:\s+(-?\d+\.\d+)", open(stats_file).read())
                lk = float(m.groups()[0])
                tree.add_property("lk", lk)
                tree.add_property("model", phyml_job.args["--model"])
                lks.append([float(tree.lk), tree.model, tree])
        elif self.lk_mode == "raxml":
            for job in self.jobs:
                if job.jobcat != "raxml":
                    continue
                raxml_job = job
                lk = (
                    open(pjoin(raxml_job.jobdir, "RAxML_log.%s" % raxml_job.args["-n"]))
                    .readline()
                    .split()[1]
                )
                tree = PhyloTree(raxml_job.args["-t"])
                tree.add_property("lk", lk)
                tree.add_property("model", raxml_job.model)
                lks.append([float(tree.lk), tree.model, tree])

        # sort lks in ASC order
        lks.sort()
        # choose the model with higher likelihood, the lastone in the list
        best_model = lks[-1][1]
        best_tree = lks[-1][2]
        log.log(
            22,
            "%s model selected from the following lk values:\n%s"
            % (best_model, "\n".join(map(str, lks))),
        )
        ModelTesterTask.store_data(self, best_model, lks)
