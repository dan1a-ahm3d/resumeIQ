"""
ResumeIQ FastAPI Application Entrypoint.
Configures CORS, custom exception handlers, routes, and OpenAPI documentation.
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.health import router as health_router
from app.api.analysis import router as analysis_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "ResumeIQ — Recruiter Decision-Support Intelligence Engine.\n"
        "Provides explainable resume-to-job matching, deterministic skill detection, "
        "TF-IDF cosine similarity, and multi-candidate ranking."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for Frontend Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches unhandled exceptions and prevents stack trace leakage."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An error occurred while processing the recruitment analysis request.",
            "details": str(exc)
        }
    )

# Mount Routers
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(analysis_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_PREFIX
    }
