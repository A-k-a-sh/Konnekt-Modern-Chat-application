import React from 'react';

const ModalConfirm = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            bg: 'bg-red-600/20',
            border: 'border-red-500/30',
            text: 'text-red-400',
            hoverBg: 'hover:bg-red-600/30',
            hoverBorder: 'hover:border-red-500/50',
            icon: 'fa-triangle-exclamation'
        },
        warning: {
            bg: 'bg-yellow-600/20',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            hoverBg: 'hover:bg-yellow-600/30',
            hoverBorder: 'hover:border-yellow-500/50',
            icon: 'fa-circle-exclamation'
        },
        info: {
            bg: 'bg-blue-600/20',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            hoverBg: 'hover:bg-blue-600/30',
            hoverBorder: 'hover:border-blue-500/50',
            icon: 'fa-circle-info'
        }
    };

    const style = typeStyles[type] || typeStyles.danger;

    return (
        <div 
            className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4'
            onClick={onClose}
        >
            <div 
                className='bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`${style.bg} ${style.border} border-b p-6 flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-full ${style.bg} ${style.border} border flex items-center justify-center`}>
                        <i className={`fa-solid ${style.icon} ${style.text} text-xl`}></i>
                    </div>
                    <h2 className='text-xl font-bold text-white flex-1'>{title}</h2>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all'
                    >
                        <i className="fa-solid fa-xmark text-gray-400 hover:text-white"></i>
                    </button>
                </div>

                {/* Body */}
                <div className='p-6'>
                    <p className='text-gray-300 leading-relaxed'>{message}</p>
                </div>

                {/* Footer */}
                <div className='flex gap-3 p-6 pt-0'>
                    <button
                        onClick={onClose}
                        className='flex-1 py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium transition-all duration-200'
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg ${style.bg} ${style.hoverBg} ${style.border} ${style.hoverBorder} ${style.text} font-medium transition-all duration-200`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirm;
