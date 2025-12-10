"""
Protocol Simulation Engine (Python)
Optional integration for advanced stochastic simulations
Uses SimPy for discrete-event simulation
"""

import json
import random
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Tuple
from datetime import datetime


@dataclass
class ProtocolStep:
    """Represents a single step in a protocol"""
    name: str
    base_duration_minutes: float
    duration_std_dev: float
    success_rate: float
    cost_per_sample: float
    reagent_usage: Dict[str, float]


@dataclass
class Sample:
    """Represents a lab sample"""
    sample_id: str
    status: str = "active"  # active, failed, completed
    yield_mg: float = 100.0
    volume_ml: float = 50.0
    quality_factor: float = 1.0


class ProtocolSimulator:
    """Stochastic protocol simulator"""

    def __init__(self, seed: int = None):
        """Initialize simulator with optional random seed"""
        if seed is not None:
            random.seed(seed)
        self.protocols = self._define_protocols()

    def _define_protocols(self) -> Dict[str, List[ProtocolStep]]:
        """Define available protocol templates"""
        return {
            "template-crispr-plasmid-prep-v1": [
                ProtocolStep(
                    name="DNA Extraction",
                    base_duration_minutes=30,
                    duration_std_dev=5,
                    success_rate=0.98,
                    cost_per_sample=5.0,
                    reagent_usage={"ethanol": 10, "buffers": 5},
                ),
                ProtocolStep(
                    name="Plasmid Amplification",
                    base_duration_minutes=120,
                    duration_std_dev=15,
                    success_rate=0.95,
                    cost_per_sample=8.0,
                    reagent_usage={"pcr_mix": 50, "primers": 2},
                ),
                ProtocolStep(
                    name="Restriction Digest",
                    base_duration_minutes=60,
                    duration_std_dev=10,
                    success_rate=0.96,
                    cost_per_sample=6.0,
                    reagent_usage={"restriction_enzyme": 5, "buffer": 10},
                ),
                ProtocolStep(
                    name="Ligation",
                    base_duration_minutes=45,
                    duration_std_dev=8,
                    success_rate=0.92,
                    cost_per_sample=12.0,
                    reagent_usage={"ligase": 2, "atp": 1},
                ),
                ProtocolStep(
                    name="Transformation",
                    base_duration_minutes=30,
                    duration_std_dev=5,
                    success_rate=0.88,
                    cost_per_sample=3.0,
                    reagent_usage={"competent_cells": 1, "recovery_media": 2},
                ),
                ProtocolStep(
                    name="Colony Selection & Verification",
                    base_duration_minutes=240,
                    duration_std_dev=30,
                    success_rate=0.85,
                    cost_per_sample=10.0,
                    reagent_usage={"antibiotics": 20, "growth_media": 100},
                ),
            ]
        }

    def run_simulation(
        self,
        template_id: str,
        num_samples: int,
        num_runs: int,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Run a complete simulation with multiple runs"""
        steps = self.protocols.get(
            template_id, self.protocols["template-crispr-plasmid-prep-v1"]
        )

        all_runs = []
        for run_idx in range(num_runs):
            run_result = self._run_single_iteration(steps, num_samples, params)
            all_runs.append(run_result)

        aggregated = self._aggregate_results(all_runs)

        return {
            "sim_id": f"sim-{datetime.now().isoformat()}",
            "template_id": template_id,
            "num_samples": num_samples,
            "num_runs": num_runs,
            "parameters": params,
            "runs": all_runs,
            "aggregated_metrics": aggregated,
        }

    def _run_single_iteration(
        self, steps: List[ProtocolStep], num_samples: int, params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run a single iteration of the protocol"""
        samples = [
            Sample(
                sample_id=f"sample-{i+1}",
                yield_mg=params.get("initial_yield", 100),
                volume_ml=params.get("initial_volume", 50),
            )
            for i in range(num_samples)
        ]

        step_results = []
        current_time = 0
        total_cost = 0

        for step in steps:
            step_result = self._execute_step(step, samples)
            step_result["start_time"] = current_time
            step_result["end_time"] = current_time + step_result["duration"]
            step_results.append(step_result)

            current_time += step_result["duration"]
            total_cost += step_result["cost"]

        active_samples = [s for s in samples if s.status == "active"]
        avg_final_yield = (
            sum(s.yield_mg for s in active_samples) / len(active_samples)
            if active_samples
            else 0
        )

        return {
            "duration_minutes": current_time,
            "total_cost": round(total_cost, 2),
            "steps": step_results,
            "final_yield_mg": round(avg_final_yield, 2),
            "success_count": len(active_samples),
            "failure_count": sum(1 for s in samples if s.status == "failed"),
        }

    def _execute_step(self, step: ProtocolStep, samples: List[Sample]) -> Dict[str, Any]:
        """Execute a single protocol step"""
        # Stochastic duration
        duration = random.gauss(
            step.base_duration_minutes, step.duration_std_dev
        )
        duration = max(duration, 0)  # Prevent negative durations

        success_count = 0
        failure_count = 0

        for sample in samples:
            if sample.status != "active":
                continue

            if random.random() < step.success_rate:
                success_count += 1
                # Apply yield loss
                sample.yield_mg *= 0.95  # 5% loss per step
            else:
                failure_count += 1
                sample.status = "failed"

            # Quality degradation
            sample.quality_factor *= 0.98

        active_samples = sum(1 for s in samples if s.status == "active")
        cost = step.cost_per_sample * active_samples

        return {
            "name": step.name,
            "duration": round(duration, 1),
            "success_count": success_count,
            "failure_count": failure_count,
            "cost": round(cost, 2),
            "reagent_usage": step.reagent_usage,
        }

    def _aggregate_results(self, runs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate metrics across multiple runs"""
        durations = [r["duration_minutes"] for r in runs]
        costs = [r["total_cost"] for r in runs]
        yields = [r["final_yield_mg"] for r in runs]
        success_counts = [r["success_count"] for r in runs]

        return {
            "avg_duration_minutes": round(sum(durations) / len(durations), 1),
            "min_duration_minutes": min(durations),
            "max_duration_minutes": max(durations),
            "std_dev_duration": round(self._std_dev(durations), 1),
            "avg_cost": round(sum(costs) / len(costs), 2),
            "min_cost": min(costs),
            "max_cost": max(costs),
            "avg_final_yield_mg": round(sum(yields) / len(yields), 2),
            "avg_success_rate": round(
                (sum(success_counts) / sum(len(runs))) * 100, 1
            ),
        }

    @staticmethod
    def _std_dev(values: List[float]) -> float:
        """Calculate standard deviation"""
        if not values:
            return 0
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        return variance ** 0.5


if __name__ == "__main__":
    # Example usage
    simulator = ProtocolSimulator(seed=42)

    result = simulator.run_simulation(
        template_id="template-crispr-plasmid-prep-v1",
        num_samples=10,
        num_runs=5,
        params={
            "initial_yield": 100,
            "initial_volume": 50,
        },
    )

    print(json.dumps(result, indent=2))
