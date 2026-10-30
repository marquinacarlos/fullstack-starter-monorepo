import strawberry
from fastapi import Depends
from sqlalchemy.orm import Session
from strawberry.fastapi import GraphQLRouter

from app.api.graphql.resolvers import Query
from app.db.session import get_db

schema = strawberry.Schema(query=Query)


async def get_context(db: Session = Depends(get_db)) -> dict:
    return {"db": db}


# GET /graphql serves the GraphiQL explorer; POST /graphql runs queries.
graphql_router = GraphQLRouter(schema, context_getter=get_context)
