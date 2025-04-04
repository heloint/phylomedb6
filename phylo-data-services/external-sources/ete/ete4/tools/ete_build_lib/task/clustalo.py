import os
import sys
import logging

log = logging.getLogger("main")

from ..master_task import AlgTask
from ..master_job import Job

from ..utils import read_fasta, OrderedDict, GLOBALS, pjoin

__all__ = ["Clustalo"]


class Clustalo(AlgTask):
    def __init__(self, nodeid, multiseq_file, seqtype, conf, confname):
        GLOBALS["citator"].add("clustalo")

        base_args = OrderedDict(
            {
                "-i": None,
                "-o": None,
                "--outfmt": "fa",
            }
        )
        self.confname = confname
        self.conf = conf
        # Initialize task
        AlgTask.__init__(
            self, nodeid, "alg", "Clustal-Omega", base_args, self.conf[self.confname]
        )

        self.seqtype = seqtype
        self.multiseq_file = multiseq_file
        self.init()

    def load_jobs(self):
        appname = self.conf[self.confname]["_app"]
        # Only one Muscle job is necessary to run this task
        args = OrderedDict(self.args)
        args["-i"] = pjoin(GLOBALS["input_dir"], self.multiseq_file)
        args["-o"] = "clustalo_alg.fasta"
        job = Job(self.conf["app"][appname], args, parent_ids=[self.nodeid])
        job.cores = self.conf["threading"].get(appname, 1)
        job.add_input_file(self.multiseq_file)
        self.jobs.append(job)

    def finish(self):
        # Once executed, alignment is converted into relaxed
        # interleaved phylip format.
        alg_file = os.path.join(self.jobs[0].jobdir, "clustalo_alg.fasta")
        # ClustalO returns a tricky fasta file
        alg = read_fasta(alg_file, header_delimiter=" ")
        fasta = alg.write(format="fasta")
        phylip = alg.write(format="iphylip_relaxed")
        AlgTask.store_data(self, fasta, phylip)
