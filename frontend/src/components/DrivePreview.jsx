export default function DrivePreview({ url }) {
  if (!url) {
    return <p>Посилання не вказано</p>;
  }

  const previewUrl = url.includes('/view')
    ? url.replace('/view', '/preview')
    : url.replace('/edit', '/preview');

  return (
    <iframe
      src={previewUrl}
      width="100%"
      height="500px"
      allow="autoplay"
      title="Перегляд сертифіката"
      style={{ border: 'none', borderRadius: 16 }}
    />
  );
}
