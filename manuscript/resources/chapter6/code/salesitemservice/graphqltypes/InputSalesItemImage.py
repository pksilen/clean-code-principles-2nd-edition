import strawberry

from ..dtos.SalesItemImage import SalesItemImage


@strawberry.experimental.pydantic.input(
    model=SalesItemImage, all_fields=True
)
class InputSalesItemImage:
    pass
