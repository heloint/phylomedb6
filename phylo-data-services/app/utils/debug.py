#!/usr/bin/env python3
from functools import wraps
import time

def timing(f):
    @wraps(f)
    def wrap(*args, **kw):
        ts = time.monotonic_ns()
        result = f(*args, **kw)
        te = time.monotonic_ns()
        execution_time: float = (te-ts)/1000000000 # nanoseconds to seconds
        print(f"==> func:{f.__name__} args: [{args} {kw}] took: {execution_time:5f}")
        return result
    return wrap
