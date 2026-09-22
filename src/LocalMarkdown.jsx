function parseInline(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function LocalMarkdown({ content = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="psy-md-list">
          {currentList.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
      return;
    }

    flushList();

    const isSectionHeader =
      /^[0-9]+\.\s+/.test(trimmed) ||
      (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80);

    if (isSectionHeader) {
      const cleanHeader = trimmed.replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h4 key={`header-${index}`} className="psy-md-header">
          {cleanHeader}
        </h4>
      );
    } else {
      elements.push(
        <p key={`p-${index}`} className="psy-md-p">
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <div className="psy-md-container">{elements}</div>;
}