import strawberry

from ..dtos.SalesItemImage import SalesItemImage


@strawberry.experimental.pydantic.type(
    model=SalesItemImage, all_fields=True
)
class OutputSalesItemImage:
    pass
