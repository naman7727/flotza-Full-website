// Modal Component
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0  flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      {/* <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
      >
        &times;
      </button> */}
      {children}
    </div>
  </div>
);

export default Modal;
