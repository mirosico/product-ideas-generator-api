export interface EmailIdea {
  name: string;
  pitch: string;
  score: number;
  topic: string;
}

export function buildIdeasEmailHtml(ideas: EmailIdea[]): string {
  const ideasHtml = ideas.map(idea => `
    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px 0; color: #111827;">${idea.name}</h3>
      <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">${idea.pitch}</p>
      <div style="display: flex; gap: 12px; align-items: center;">
        <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
          Score: ${idea.score}
        </span>
        <span style="background: #e5e7eb; color: #374151; padding: 4px 12px; border-radius: 16px; font-size: 12px;">
          ${idea.topic}
        </span>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="margin: 0 0 8px 0; color: #111827; font-size: 24px;">New Product Ideas!</h1>
      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
        We've discovered ${ideas.length} new product opportunities based on your interests.
      </p>

      ${ideasHtml}

      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
          Product Ideas Generator
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function buildIdeasEmailText(ideas: EmailIdea[]): string {
  const ideasText = ideas.map(idea => `
${idea.name} (Score: ${idea.score})
${idea.pitch}
Topic: ${idea.topic}
---`).join('\n');

  return `New Product Ideas!

We've discovered ${ideas.length} new product opportunities based on your interests.

${ideasText}

---
Product Ideas Generator`;
}
