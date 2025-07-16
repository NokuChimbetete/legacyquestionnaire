// Type definitions for dnd-kit libraries to work with strict TypeScript

declare module "@dnd-kit/core" {
  export type UniqueIdentifier = string | number;

  export interface Active {
    id: UniqueIdentifier;
    data: {
      current?: Record<string, unknown>;
    };
    rect: {
      current: {
        initial?: DOMRect | null;
        translated?: DOMRect | null;
      };
    };
  }

  export interface Over {
    id: UniqueIdentifier;
    data: {
      current?: Record<string, unknown>;
    };
    rect: DOMRect;
    disabled: boolean;
  }

  export interface DraggableAttributes {
    role: string;
    tabIndex: number;
    "aria-disabled": boolean;
    "aria-pressed": boolean | undefined;
    "aria-roledescription": string;
    "aria-describedby": string;
  }

  export interface DragEndEvent {
    active: Active;
    over: Over | null;
    delta: {
      x: number;
      y: number;
    };
    collisions: unknown[] | null;
  }

  export interface DragStartEvent {
    active: Active;
  }

  export interface SensorProps {
    activationConstraint?: {
      distance?: number;
      delay?: number;
      tolerance?: number;
    };
    coordinateGetter?: unknown;
  }

  export interface UseSensorReturn {
    sensor: unknown;
  }

  export function DndContext(props: {
    sensors: unknown[];
    collisionDetection: unknown;
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    children: React.ReactNode;
  }): JSX.Element;

  export function DragOverlay(props: {
    children: React.ReactNode;
  }): JSX.Element;

  export function useSensor(
    sensor: unknown,
    options?: SensorProps,
  ): UseSensorReturn;

  export function useSensors(...sensors: UseSensorReturn[]): unknown[];

  export const PointerSensor: unknown;
  export const KeyboardSensor: unknown;
  export const closestCenter: unknown;
}

declare module "@dnd-kit/core/dist/hooks/utilities" {
  export interface SyntheticListenerMap {
    onPointerDown?: (event: React.PointerEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    [key: string]: unknown;
  }
}

declare module "@dnd-kit/utilities" {
  export interface Transform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  }

  export namespace CSS {
    export namespace Transform {
      export function toString(transform: Transform | null): string;
    }
  }
}

declare module "@dnd-kit/sortable" {
  import type {
    UniqueIdentifier,
    Active,
    Over,
    DraggableAttributes,
  } from "@dnd-kit/core";
  import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
  import type { Transform } from "@dnd-kit/utilities";

  export interface UseSortableReturn {
    active: Active | null;
    activeIndex: number;
    attributes: DraggableAttributes;
    data: {
      sortable: {
        containerId: string;
        items: UniqueIdentifier[];
        index: number;
      };
    };
    rect: React.MutableRefObject<DOMRect | null>;
    index: number;
    newIndex: number;
    items: UniqueIdentifier[];
    isOver: boolean;
    isSorting: boolean;
    isDragging: boolean;
    listeners: SyntheticListenerMap | undefined;
    node: React.MutableRefObject<HTMLElement | null>;
    overIndex: number;
    over: Over | null;
    setNodeRef: (node: HTMLElement | null) => void;
    transform: Transform | null;
    transition: string | null;
  }

  export function useSortable(props: {
    id: UniqueIdentifier;
  }): UseSortableReturn;

  export function arrayMove<T>(array: T[], from: number, to: number): T[];

  export function SortableContext(props: {
    items: UniqueIdentifier[];
    strategy: unknown;
    children: React.ReactNode;
  }): JSX.Element;

  export const sortableKeyboardCoordinates: unknown;
  export const verticalListSortingStrategy: unknown;
}
