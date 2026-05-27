/**
 * Export Utilities for Dashboard Data
 */

/**
 * Export a list of posts to a CSV file
 * @param {Array} posts List of processed posts
 */
export function exportToCSV(posts) {
  if (!posts || posts.length === 0) {
    alert('No posts available to export.');
    return;
  }

  // Define headers
  const headers = [
    'Post ID',
    'Platform',
    'Author Handle',
    'Author Name',
    'Original Content',
    'Region/Country',
    'Category',
    'Sentiment',
    'Likes',
    'Shares',
    'Comments',
    'AI Summary',
    'Timestamp',
    'Spam Flag'
  ];

  // Helper to escape values for CSV
  const escapeCSV = (val) => {
    if (val === undefined || val === null) return '';
    let stringVal = String(val);
    // Replace double quotes with two double quotes
    stringVal = stringVal.replace(/"/g, '""');
    // Wrap in double quotes if it contains commas, quotes, or newlines
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
      return `"${stringVal}"`;
    }
    return stringVal;
  };

  // Build CSV rows
  const csvRows = [headers.join(',')];

  posts.forEach(post => {
    const row = [
      escapeCSV(post.id),
      escapeCSV(post.platform),
      escapeCSV(post.author),
      escapeCSV(post.authorName),
      escapeCSV(post.text),
      escapeCSV(post.region),
      escapeCSV(post.category),
      escapeCSV(post.sentiment),
      post.likes || 0,
      post.shares || 0,
      post.comments || 0,
      escapeCSV(post.summary),
      escapeCSV(post.timestamp),
      post.isGibberish ? 'Yes' : 'No'
    ];
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `passport_social_media_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function fallbackPrint(posts, activeFilters = {}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup blocked! Please allow popups to export PDF via print dialog.');
    return;
  }
  
  // Format filter values
  const filterDesc = Object.entries(activeFilters)
    .filter(([_, val]) => val && val !== 'all')
    .map(([key, val]) => `<span class="badge">${key}: <strong>${val}</strong></span>`)
    .join(' ');

  const postsHtml = posts.map((post, idx) => `
    <div class="post-item">
      <div class="post-header">
        <span class="post-num">#${idx + 1}</span>
        <span class="platform badge">${post.platform}</span>
        <span class="author"><strong>${post.authorName}</strong> (${post.author})</span>
        <span class="category badge">${post.category}</span>
        <span class="sentiment badge sentiment-${post.sentiment}">${post.sentiment}</span>
        <span class="region badge">${post.region}</span>
      </div>
      <div class="post-text">${post.text}</div>
      <div class="ai-summary">
        <strong>AI Summary:</strong> ${post.summary || 'N/A'}
      </div>
      <div class="post-meta">
        Likes: ${post.likes || 0} | Shares: ${post.shares || 0} | Comments: ${post.comments || 0} | 
        Time: ${new Date(post.timestamp).toLocaleString()}
      </div>
    </div>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Social Media Passport Scraper Report</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #333;
            padding: 40px 30px;
            line-height: 1.5;
          }
          .report-header {
            border-bottom: 2px solid #5b21b6;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .logo-area {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #5b21b6;
          }
          .report-title {
            font-size: 28px;
            margin-top: 10px;
            margin-bottom: 5px;
          }
          .timestamp {
            color: #666;
            font-size: 13px;
          }
          .filters-section {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 12px 15px;
            margin-bottom: 25px;
            font-size: 13px;
          }
          .badge {
            background-color: #e5e7eb;
            color: #374151;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 11px;
            margin-right: 5px;
            display: inline-block;
          }
          .sentiment-Positive { background-color: #d1fae5; color: #065f46; }
          .sentiment-Negative { background-color: #fee2e2; color: #991b1b; }
          .sentiment-Neutral { background-color: #f3f4f6; color: #374151; }
          
          .post-item {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .post-header {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
            font-size: 13px;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 8px;
          }
          .post-num {
            font-weight: bold;
            color: #5b21b6;
          }
          .post-text {
            font-size: 14px;
            margin-bottom: 12px;
            white-space: pre-wrap;
          }
          .ai-summary {
            background-color: #f5f3ff;
            border-left: 3px solid #8b5cf6;
            padding: 8px 12px;
            font-size: 13px;
            margin-bottom: 10px;
            border-radius: 0 4px 4px 0;
          }
          .post-meta {
            font-size: 11px;
            color: #888;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="logo-area">
            <div class="logo-text">Zebvo Newswire</div>
            <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          <h1 class="report-title">Social Media Scraper: Passport Aggregation Report</h1>
          <p>Real-time passport tracking dashboard data aggregation.</p>
        </div>
        
        <div class="filters-section">
          <strong>Active Filters:</strong> ${filterDesc || 'None (Showing All)'} 
          <span style="float: right;"><strong>Total Posts:</strong> ${posts.length}</span>
        </div>

        <div class="posts-list">
          ${postsHtml}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Export a list of posts to a PDF report via printing
 * @param {Array} posts List of processed posts
 * @param {Object} activeFilters Active filters description
 */
export function exportToPDF(posts, activeFilters = {}) {
  if (!posts || posts.length === 0) {
    alert('No posts available to export.');
    return;
  }

  // Load html2pdf from CDN dynamically
  const scriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  
  const generatePDF = () => {
    // Format filter values
    const filterDesc = Object.entries(activeFilters)
      .filter(([_, val]) => val && val !== 'all')
      .map(([key, val]) => `<span class="badge">${key}: <strong>${val}</strong></span>`)
      .join(' ');

    const postsHtml = posts.map((post, idx) => `
      <div class="post-item">
        <div class="post-header">
          <span class="post-num">#${idx + 1}</span>
          <span class="platform badge">${post.platform}</span>
          <span class="author"><strong>${post.authorName}</strong> (${post.author})</span>
          <span class="category badge">${post.category}</span>
          <span class="sentiment badge sentiment-${post.sentiment}">${post.sentiment}</span>
          <span class="region badge">${post.region}</span>
        </div>
        <div class="post-text">${post.text}</div>
        <div class="ai-summary">
          <strong>AI Summary:</strong> ${post.summary || 'N/A'}
        </div>
        <div class="post-meta">
          Likes: ${post.likes || 0} | Shares: ${post.shares || 0} | Comments: ${post.comments || 0} | 
          Time: ${new Date(post.timestamp).toLocaleString()}
        </div>
      </div>
    `).join('');

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.background = '#ffffff';
    container.style.color = '#333333';
    container.style.zIndex = '-9999';
    
    container.innerHTML = `
      <style>
        .report-content {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          padding: 30px;
          line-height: 1.5;
        }
        .report-header {
          border-bottom: 2px solid #5b21b6;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .logo-area {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #5b21b6;
        }
        .report-title {
          font-size: 24px;
          margin-top: 10px;
          margin-bottom: 5px;
          color: #111;
        }
        .timestamp {
          color: #666;
          font-size: 13px;
        }
        .filters-section {
          background-color: #f3f4f6;
          border-radius: 6px;
          padding: 12px 15px;
          margin-bottom: 25px;
          font-size: 13px;
        }
        .badge {
          background-color: #e5e7eb;
          color: #374151;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 11px;
          margin-right: 5px;
          display: inline-block;
        }
        .sentiment-Positive { background-color: #d1fae5; color: #065f46; }
        .sentiment-Negative { background-color: #fee2e2; color: #991b1b; }
        .sentiment-Neutral { background-color: #f3f4f6; color: #374151; }
        
        .post-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .post-header {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 13px;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 8px;
        }
        .post-num {
          font-weight: bold;
          color: #5b21b6;
        }
        .post-text {
          font-size: 14px;
          margin-bottom: 12px;
          white-space: pre-wrap;
        }
        .ai-summary {
          background-color: #f5f3ff;
          border-left: 3px solid #8b5cf6;
          padding: 8px 12px;
          font-size: 13px;
          margin-bottom: 10px;
          border-radius: 0 4px 4px 0;
        }
        .post-meta {
          font-size: 11px;
          color: #888;
          display: flex;
          justify-content: space-between;
        }
      </style>
      <div class="report-content">
        <div class="report-header">
          <div class="logo-area">
            <div class="logo-text">Zebvo Newswire</div>
            <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          <h1 class="report-title">Social Media Scraper: Passport Aggregation Report</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Real-time passport tracking dashboard data aggregation.</p>
        </div>
        
        <div class="filters-section">
          <strong>Active Filters:</strong> ${filterDesc || 'None (Showing All)'} 
          <span style="float: right;"><strong>Total Posts:</strong> ${posts.length}</span>
        </div>

        <div class="posts-list">
          ${postsHtml}
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const opt = {
      margin:       10,
      filename:     `passport_social_media_report_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Wait for DOM parsing and layout resolution
    setTimeout(() => {
      window.html2pdf()
        .set(opt)
        .from(container)
        .save()
        .then(() => {
          document.body.removeChild(container);
        })
        .catch(err => {
          console.error('PDF Generation Error:', err);
          document.body.removeChild(container);
          fallbackPrint(posts, activeFilters);
        });
    }, 300);
  };

  if (window.html2pdf) {
    generatePDF();
  } else {
    // Dynamically load the script
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = () => {
      generatePDF();
    };
    script.onerror = () => {
      console.warn('Failed to load html2pdf from CDN, falling back to window.print');
      fallbackPrint(posts, activeFilters);
    };
    document.head.appendChild(script);
  }
}
