// Adapted from shadcn/ui — store is module-level so toasts survive re-renders
import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type Action =
  | { type: 'ADD';     toast: ToasterToast }
  | { type: 'UPDATE';  toast: Partial<ToasterToast> & { id: string } }
  | { type: 'DISMISS'; toastId?: string }
  | { type: 'REMOVE';  toastId?: string };

interface State { toasts: ToasterToast[] }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

let count = 0;
function genId() { count = (count + 1) % Number.MAX_SAFE_INTEGER; return String(count); }

function addToRemoveQueue(id: string) {
  if (toastTimeouts.has(id)) return;
  const t = setTimeout(() => {
    toastTimeouts.delete(id);
    dispatch({ type: 'REMOVE', toastId: id });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(id, t);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD':
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case 'UPDATE':
      return { toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)) };
    case 'DISMISS': {
      const { toastId } = action;
      if (toastId) addToRemoveQueue(toastId);
      else state.toasts.forEach((t) => addToRemoveQueue(t.id));
      return {
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      };
    }
    case 'REMOVE':
      return action.toastId === undefined
        ? { toasts: [] }
        : { toasts: state.toasts.filter((t) => t.id !== action.toastId) };
  }
}

const listeners: Array<(s: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

type ToastInput = Omit<ToasterToast, 'id'>;

export function toast(props: ToastInput) {
  const id = genId();
  const dismiss = () => dispatch({ type: 'DISMISS', toastId: id });
  dispatch({
    type: 'ADD',
    toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss(); } },
  });
  return { id, dismiss };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { listeners.splice(listeners.indexOf(setState), 1); };
  }, []);
  return {
    ...state,
    toast,
    dismiss: (id?: string) => dispatch({ type: 'DISMISS', toastId: id }),
  };
}
