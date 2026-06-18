import { useToastContext } from '../context/ToastContext';

const useToast = () => {
  const { toast, removeToast } = useToastContext();
  return { toast, removeToast };
};

export default useToast;
