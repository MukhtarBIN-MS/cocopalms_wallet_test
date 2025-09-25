// components/Modal.tsx
"use client";

import { Fragment, ReactNode, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}) {
  // Will be used as the initial focus target (first input in your form will grab it)
  const initialRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const content = (
    <Transition.Root show={open} as={Fragment}>
      {/* IMPORTANT: keep onClose stable from parent via useCallback */}
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={initialRef}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-12">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-150"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              {/* static prevents unmounting during transition phases */}
              <Dialog.Panel
                // @ts-expect-error headlessui accepts 'static'
                static
                className={`w-full ${width} transform overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b">
                  <Dialog.Title className="text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 max-h-[80vh] overflow-y-auto">
                  {/* Invisible focus sentinel so the trap doesn't steal focus from your inputs */}
                  <div ref={initialRef} tabIndex={-1} />
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );

  // Portal keeps the dialog out of re-rendering parent subtree
  return createPortal(content, document.body);
}
