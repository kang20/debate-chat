/* eslint-disable */
const { useState, useEffect, useRef, forwardRef } = React;

// ===== Button =====
const btnVariants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-gray-600 hover:bg-gray-100',
  pro: 'bg-blue-600 text-white hover:bg-blue-700',
  con: 'bg-red-600 text-white hover:bg-red-700',
};
const btnSizes = { sm:'px-3 py-1.5 text-sm', md:'px-4 py-2 text-sm', lg:'px-6 py-3 text-base' };
function Button({ variant='primary', size='md', className='', disabled, children, ...rest }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...rest}>
      {children}
    </button>
  );
}

// ===== Input =====
const Input = forwardRef(function Input({ label, error, id, className='', ...rest }, ref) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <input ref={ref} id={id}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${error?'border-red-500 focus:border-red-500 focus:ring-red-500':''} ${className}`}
        {...rest}/>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

// ===== Avatar =====
function Avatar({ name, size='md', className='' }) {
  const sizes = { sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-16 h-16 text-xl' };
  return (
    <div className={`flex items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700 ${sizes[size]} ${className}`}>
      {(name||'').slice(0,2)}
    </div>
  );
}

// ===== Badge / SideBadge =====
const sideStyles = { PRO:'bg-blue-100 text-blue-800', CON:'bg-red-100 text-red-800', NEUTRAL:'bg-gray-100 text-gray-600' };
const sideLabels = { PRO:'찬성', CON:'반대', NEUTRAL:'중립' };
function Badge({ children, variant='default', className='' }) {
  const vmap = { default:'bg-gray-100 text-gray-700', pro:sideStyles.PRO, con:sideStyles.CON, neutral:sideStyles.NEUTRAL };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${vmap[variant]||vmap.default} ${className}`}>{children}</span>;
}
function SideBadge({ side }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sideStyles[side]}`}>{sideLabels[side]}</span>;
}

// ===== Spinner =====
function Spinner({ size='md' }) {
  const sizes = { sm:'w-4 h-4', md:'w-8 h-8', lg:'w-12 h-12' };
  return <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 ${sizes[size]}`}/>;
}
function PageSpinner() { return <div className="flex h-64 items-center justify-center"><Spinner size="lg"/></div>; }

// ===== Modal =====
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow=''; }; }
  }, [open]);
  if (!open) return null;
  const X = window.Icons.X;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl mx-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ===== EmptyState =====
function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

Object.assign(window, { Button, Input, Avatar, Badge, SideBadge, Spinner, PageSpinner, Modal, EmptyState });
