import { Injectable } from '@nestjs/common';
import { WorkflowDefinition, WorkflowState, WorkflowTransition } from '@prisma/client';

/**
 * WorkflowValidationService
 * 
 * PURE DOMAIN SERVICE (per VALIDATION ENGINE LAWS):
 * - NO database writes/mutations
 * - NO HTTP/controller awareness
 * - NO Stage 3 logic (instances, execution, tasks, evidence)
 * - Deterministic and testable
 * - Returns structured errors (no side effects)
 */

export interface ValidationError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

@Injectable()
export class WorkflowValidationService {
  /**
   * Validate workflow definition before activation
   * 
   * Checks:
   * 1. Exactly ONE start state
   * 2. At least ONE end state
   * 3. All states reachable from start
   * 4. No orphan states
   */
  validate(
    definition: WorkflowDefinition,
    states: WorkflowState[],
    transitions: WorkflowTransition[],
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Check 1: Exactly one start state
    const startStates = states.filter((s) => s.isStart);
    if (startStates.length === 0) {
      errors.push({
        code: 'NO_START_STATE',
        message: 'Workflow must have exactly one start state',
      });
    } else if (startStates.length > 1) {
      errors.push({
        code: 'MULTIPLE_START_STATES',
        message: 'Workflow must have exactly one start state',
        details: { count: startStates.length },
      });
    }

    // Check 2: At least one end state
    const endStates = states.filter((s) => s.isEnd);
    if (endStates.length === 0) {
      errors.push({
        code: 'NO_END_STATE',
        message: 'Workflow must have at least one end state',
      });
    }

    // Check 3 & 4: Reachability and orphan detection
    if (startStates.length === 1 && states.length > 0) {
      const reachable = this.getReachableStates(startStates[0].id, states, transitions);
      const orphans = states.filter((s) => !reachable.has(s.id));

      if (orphans.length > 0) {
        errors.push({
          code: 'ORPHAN_STATES',
          message: 'All states must be reachable from the start state',
          details: {
            orphanStates: orphans.map((s) => ({ id: s.id, name: s.name })),
          },
        });
      }
    }

    // Check 5: No transitions to/from non-existent states
    const stateIds = new Set(states.map((s) => s.id));
    const invalidTransitions = transitions.filter(
      (t) => !stateIds.has(t.fromStateId) || !stateIds.has(t.toStateId),
    );

    if (invalidTransitions.length > 0) {
      errors.push({
        code: 'INVALID_TRANSITIONS',
        message: 'Transitions reference non-existent states',
        details: {
          invalidTransitions: invalidTransitions.map((t) => ({
            id: t.id,
            fromStateId: t.fromStateId,
            toStateId: t.toStateId,
          })),
        },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all states reachable from a given start state
   * Uses BFS to traverse the graph
   */
  private getReachableStates(
    startStateId: string,
    states: WorkflowState[],
    transitions: WorkflowTransition[],
  ): Set<string> {
    const reachable = new Set<string>();
    const queue: string[] = [startStateId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (reachable.has(currentId)) continue;

      reachable.add(currentId);

      // Find all transitions from current state
      const outgoing = transitions.filter((t) => t.fromStateId === currentId);
      outgoing.forEach((t) => {
        if (!reachable.has(t.toStateId)) {
          queue.push(t.toStateId);
        }
      });
    }

    return reachable;
  }
}
