'use client';

const PreviewCard = ({ title, buttonText, buttonColor, onClick }: {
  title: string; buttonText: string; buttonColor: string; onClick?: () => void;
}) => (
  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-40">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">{title}</h3>
    <button 
      onClick={onClick} 
      className="w-full py-3 rounded-xl mt-4 text-white text-sm font-semibold transition-opacity hover:opacity-90" 
      style={{ backgroundColor: buttonColor }}
    >
      {buttonText}
    </button>
  </div>
);

const DesignPreviewSection = ({ data }: { data: any }) => {
  if (!data?.finalProjectLink && !data?.repository) return null;

  const handleRedirect = (url: string) => {
    if (!url) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    window.open(finalUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
      {data.finalProjectLink && (
        <PreviewCard 
          title="Project Live Preview" 
          buttonText="View Live Project" 
          buttonColor="#A855F7" 
          onClick={() => handleRedirect(data.finalProjectLink)} 
        />
      )}
      {data.repository && (
        <PreviewCard 
          title="Project Source Code" 
          buttonText="View Repository" 
          buttonColor="#3b82f6" 
          onClick={() => handleRedirect(data.repository)} 
        />
      )}
    </div>
  );
};

export default DesignPreviewSection;