import logging
from typing import Optional

logger = logging.getLogger(__name__)


class PipelineConfig:
    """
    Placeholder pipeline configuration.

    Full Pipecat voice pipeline integration can be enabled
    by installing pipecat-ai with the required extras.
    """

    def __init__(self, bot, transport_params=None):
        self.bot = bot
        self.transport_params = transport_params
        self.pipeline = None

    async def build_pipeline(self):
        """Build the pipeline (requires pipecat-ai installed)."""
        logger.warning("Pipecat not available - voice pipeline disabled")
        return None

    async def run_pipeline(self) -> None:
        """Run the pipeline."""
        logger.warning("Pipecat not available - voice pipeline disabled")

    async def cleanup(self) -> None:
        """Cleanup pipeline resources."""
        self.pipeline = None


def create_pipeline_config(bot, transport_params=None) -> PipelineConfig:
    """Factory function to create a PipelineConfig."""
    return PipelineConfig(bot=bot, transport_params=transport_params)
