"""3DClash's server package (clash3d).

The repo's .env is read here, on the first import of any module of the package, because several modules read their
settings at import (service.MAX_SCENES, step.MAX_PARTS, scene.BIG_MODEL_BYTES, built.CACHE, ...). Real environment
variables win.
"""
import os as _os

from .meta_client import load_env

load_env()

# Settings written before the rename use SIGHTLINE_* names, and the live Modal secret still does. Read each one under
# its CLASH3D_ name unless that is already set, so nothing changes until the secret is migrated.
for _name in [n for n in _os.environ if n.startswith("SIGHTLINE_")]:
    _os.environ.setdefault("CLASH3D_" + _name[len("SIGHTLINE_"):], _os.environ[_name])
