import os
import sys
import re
import shutil

import logging

log = logging.getLogger("main")

from ..master_task import TreeTask
from ..master_job import Job
from ..utils import basename, Tree, OrderedDict, GLOBALS, DATATYPES, pjoin
from .. import db

__all__ = ["FastTree"]


class FastTree(TreeTask):
    def __init__(
        self,
        nodeid,
        alg_file,
        constrain_id,
        model,
        seqtype,
        conf,
        confname,
        parts_id=None,
    ):
        GLOBALS["citator"].add("fasttree")

        self.confname = confname
        self.conf = conf
        self.alg_phylip_file = alg_file
        self.constrain_tree = None
        if constrain_id:
            self.constrain_tree = db.get_dataid(constrain_id, DATATYPES.constrain_alg)
        self.alg_basename = basename(self.alg_phylip_file)
        self.seqtype = seqtype
        self.tree_file = ""
        if model:
            log.warning("FastTree does not support model selection")

        self.model = None
        self.lk = None

        base_args = OrderedDict()
        base_args["-nopr"] = ""
        if self.seqtype == "nt":
            base_args["-gtr -nt"] = ""
        elif self.seqtype == "aa":
            pass
        else:
            raise ValueError("Unknown seqtype %s" % self.seqtype)

        TreeTask.__init__(
            self, nodeid, "tree", "FastTree", base_args, self.conf[confname]
        )

        self.init()

    def load_jobs(self):
        args = self.args.copy()

        try:
            del args["-wag"]
        except KeyError:
            pass

        if self.constrain_tree:
            args["-constraints"] = pjoin(GLOBALS["input_dir"], self.constrain_tree)

        args[pjoin(GLOBALS["input_dir"], self.alg_phylip_file)] = ""
        appname = self.conf[self.confname]["_app"]

        job = Job(self.conf["app"][appname], args, parent_ids=[self.nodeid])
        job.cores = self.conf["threading"][appname]
        if self.constrain_tree:
            job.add_input_file(self.constrain_tree)
        job.add_input_file(self.alg_phylip_file)
        self.jobs.append(job)

    def finish(self):
        job = self.jobs[-1]
        t = Tree(open(job.stdout_file))
        TreeTask.store_data(self, t.write(), {})
