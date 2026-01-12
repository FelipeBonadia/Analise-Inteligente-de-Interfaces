import { marked } from 'marked';

function MarkdownRenderer({ content }: { content: string }) {

    if (!content) {
        return null;
    }

    marked.setOptions({
        breaks: true,
        gfm: true
    });

    const htmlConvertido = marked.parse(content);

    return (
        <div 
            className="markdown-content text-left"
            dangerouslySetInnerHTML={{ __html: htmlConvertido }} 
        />
    );
}

export default MarkdownRenderer;