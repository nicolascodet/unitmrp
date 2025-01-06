from .parts import router as parts_router
from .bom import router as bom_router
from .orders import router as orders_router
from .purchase_orders import router as purchase_orders_router
from .inventory import router as inventory_router
from .materials import router as materials_router
from .quality_checks import router as quality_checks_router
from .production_runs import router as production_runs_router
from .suppliers import router as suppliers_router
from .customers import router as customers_router

__all__ = [
    "parts_router",
    "bom_router",
    "orders_router",
    "purchase_orders_router",
    "inventory_router",
    "materials_router",
    "quality_checks_router",
    "production_runs_router",
    "suppliers_router",
    "customers_router",
] 