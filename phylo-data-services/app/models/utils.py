from typing import Any
from typing import Iterable
from typing import Iterator
from typing import Type
from typing import TypeVar

import mariadb  # type: ignore
from pydantic import BaseModel

T = TypeVar("T", bound="BaseModel")


def generate_instances_from_cursor(
    model_class: Type[T], cursor: mariadb.Cursor
) -> Iterator[T]:
    """
    This function generates instances of a Pydantic model from a database cursor.
    It iterates over the cursor, mapping each row's values to corresponding model
    fields using enumeration.
    """
    for row in cursor:
        yield model_class(
            **{
                key: row[index]
                for index, key in enumerate(model_class.model_fields.keys())
            }
        )


def get_pydantic_model_field_names(
    model_class: BaseModel | Type[T], fields_to_ignore: Iterable[str] = []
) -> tuple[str, ...]:
    """
    Returns the field names of a Pydantic model as a tuple. Optionally, you
    can specify fields to ignore by passing them in fields_to_ignore.
    """
    return tuple(
        field
        for field in model_class.model_fields.keys()
        if field not in fields_to_ignore
    )


def get_iterable_placeholders(
    value_iterable: Iterable[Any],
) -> tuple[str, ...]:
    """
    Generates SQL placeholders (?) for an iterable of values. Useful for
    creating parameterized SQL queries where the number of placeholders matches the number of values.
    """
    return tuple("?" for value in value_iterable)


def get_named_placeholders_from_class(
    model_class: BaseModel, columns_to_ignore: Iterable[str] = []
) -> tuple[str, ...]:
    """
    Generates named SQL placeholders (field=?) for a Pydantic model.
    Allows ignoring specific model fields with columns_to_ignore.
    """
    return tuple(
        f"{field}=?"
        for field in model_class.__fields__.keys()
        if field not in columns_to_ignore
    )
