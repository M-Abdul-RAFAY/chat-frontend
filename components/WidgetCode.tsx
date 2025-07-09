interface WidgetCodeProps {
  widgetId: string;
}

const WidgetCode = ({ widgetId }: WidgetCodeProps) => {
  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

  const iframeCode = `<iframe
      src="${frontendUrl}/widget?id=${widgetId}"
      style="
        position: fixed;
        bottom: 1px;
        right: 24px;
        width: 350px;
        height: 500px;
        border: none;
        background: transparent;
        z-index: 9999;
      "
      allowtransparency="true"
    ></iframe>`;

  return (
    <div className="flex mt-2 items-center justify-center">
      {/* Iframe Code Modal */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Widget Code
        </h2>
        <p className="text-gray-600 mb-4">
          Copy this code and paste it into your website&apos;s HTML to add the
          chat widget:
        </p>
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all">
            {iframeCode}
          </pre>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigator.clipboard.writeText(iframeCode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetCode;
