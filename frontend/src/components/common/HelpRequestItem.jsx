const HelpRequestItem = ({ helpRequest, onRead, onDelete }) => {
  const isRead = Boolean(helpRequest.read_at);

  return (
    <div
      className={`relative rounded-xl border p-4 transition hover:shadow-md ${
        isRead
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
      }`}
    >
      {!isRead && (
        <span className="absolute right-3 top-3 rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
          Nova
        </span>
      )}

      <h3 className="font-semibold">{helpRequest.title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        {helpRequest.description}
      </p>

      <div className="mt-3 flex gap-4 text-sm">
        {!isRead && (
          <button
            onClick={() => onRead(helpRequest.id)}
            className="text-primary-600 hover:underline"
          >
            Marcar como lido
          </button>
        )}
        <button
          onClick={() => onDelete(helpRequest.id)}
          className="text-red-600 hover:underline"
        >
          Excluir
        </button>
      </div>
    </div>
  );
};

export default HelpRequestItem;
