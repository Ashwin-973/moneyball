"""Custom exception classes and global exception handlers."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse


# ── Custom Exceptions ──────────────────────────────────────────


class NotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found") -> None:
        super().__init__(status_code=404, detail=detail)


class UnauthorizedError(HTTPException):
    def __init__(self, detail: str = "Not authenticated") -> None:
        super().__init__(status_code=401, detail=detail)


class ForbiddenError(HTTPException):
    def __init__(self, detail: str = "Not enough permissions") -> None:
        super().__init__(status_code=403, detail=detail)


class ConflictError(HTTPException):
    def __init__(self, detail: str = "Resource already exists") -> None:
        super().__init__(status_code=409, detail=detail)


# ── Global Handler Registration ───────────────────────────────


def _build_error_body(status_code: int, detail: str) -> dict:
    return {
        "error": _status_label(status_code),
        "detail": detail,
        "status_code": status_code,
    }


def _status_label(code: int) -> str:
    labels = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        422: "Validation Error",
        500: "Internal Server Error",
    }
    return labels.get(code, "Error")


async def _http_exception_handler(
    _request: Request, exc: HTTPException
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=_build_error_body(exc.status_code, str(exc.detail)),
    )


async def _generic_exception_handler(
    _request: Request, _exc: Exception
) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=_build_error_body(500, "An unexpected error occurred"),
    )


def add_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI app."""
    app.add_exception_handler(HTTPException, _http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, _generic_exception_handler)
