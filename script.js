document.addEventListener('DOMContentLoaded', () => {
    // --- 主題資料定義 ---
    const THEMES = {
        cyberpunk: { primary: '#00f2fe', accent: '#ff00ff', orb1: '#6effff', orb2: '#ff00ff', diff: 7 },
        wood: { primary: '#d97706', accent: '#78350f', orb1: '#92400e', orb2: '#451a03', diff: 3 },
        space: { primary: '#a855f7', accent: '#3b82f6', orb1: '#1e1b4b', orb2: '#581c87', diff: 6 },
        crystal: { primary: '#99f6e4', accent: '#2dd4bf', orb1: '#f0f9ff', orb2: '#7dd3fc', diff: 4 },
        forest: { primary: '#22c55e', accent: '#15803d', orb1: '#14532d', orb2: '#064e3b', diff: 5 },
        sun: { primary: '#f97316', accent: '#b91c1c', orb1: '#facc15', orb2: '#ea580c', diff: 8 },
        blackwhite: { primary: '#ffffff', accent: '#000000', orb1: '#333333', orb2: '#666666', diff: 9 },
        rainbow: { primary: '#f43f5e', accent: '#8b5cf6', orb1: '#10b981', orb2: '#3b82f6', diff: 10 },
        pinkbubble: { primary: '#f472b6', accent: '#db2777', orb1: '#fbcfe8', orb2: '#f9a8d4', diff: 4 }
    };

    // --- 預覽與表單元素 ---
    const inTitle = document.getElementById('input-title');
    const inContent = document.getElementById('input-content');
    const inBtn = document.getElementById('input-btn');
    const inAlert = document.getElementById('input-alert');
    const inCopy = document.getElementById('input-copyright');
    const fileInput = document.getElementById('input-image');
    
    // 主題與圖示選擇
    const inThemeSelect = document.getElementById('input-theme-select');
    let selectedPrimaryIcon = 'fa-gift';
    let selectedButtonIcon = 'fa-hand-pointer';

    const preTitle = document.getElementById('preview-title');
    const preContent = document.getElementById('preview-content');
    const preBtn = document.getElementById('preview-btn');
    const preCopy = document.getElementById('preview-copyright');
    const preMascot = document.getElementById('preview-mascot');
    const previewFrame = document.getElementById('preview-frame');
    
    // 吉祥物檔案狀態
    let mascotFile = null;
    let mascotExt = '.svg';
    let mascotBase64 = null; // 供預覽用

    // --- 即時預覽更新 ---
    const updatePreview = () => {
        const theme = THEMES[inThemeSelect.value] || THEMES.cyberpunk;

        // 更新文字與圖示
        preTitle.innerHTML = `<i class="fa-solid ${selectedPrimaryIcon} pulse-icon"></i> ${inTitle.value}`;
        preContent.innerHTML = inContent.value;
        preBtn.innerHTML = `<i class="fa-solid ${selectedButtonIcon}"></i> ${inBtn.value}`;
        preCopy.innerHTML = inCopy.value;

        // 更新預覽框的 CSS 變數
        previewFrame.style.setProperty('--primary-color', theme.primary);
        previewFrame.style.setProperty('--primary-color-end', adjustColor(theme.primary, -20));
        previewFrame.style.setProperty('--accent-color', theme.accent);
        previewFrame.style.setProperty('--accent-color-end', adjustColor(theme.accent, -30));
        previewFrame.style.setProperty('--orb-1-color', theme.orb1);
        previewFrame.style.setProperty('--orb-2-color', theme.orb2);
        previewFrame.style.setProperty('--text-glow', `rgba(${hexToRgb(theme.primary)}, 0.5)`);
    };

    // 輔助函式：調整顏色亮度
    function adjustColor(hex, percent) {
        if (!hex.startsWith('#')) return hex;
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.max(0, Math.min(255, r + percent));
        g = Math.max(0, Math.min(255, g + percent));
        b = Math.max(0, Math.min(255, b + percent));
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 輔助函式：HEX 轉 RGB
    function hexToRgb(hex) {
        if (!hex.startsWith('#')) return '0, 255, 255';
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }

    [inTitle, inContent, inBtn, inAlert, inCopy, inThemeSelect].forEach(el => {
        el.addEventListener('input', updatePreview);
    });

    // --- 圖示選擇邏輯 ---
    const setupIconPickers = (containerId, callback) => {
        const container = document.getElementById(containerId);
        const btns = container.querySelectorAll('.icon-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                callback(btn.getAttribute('data-icon'));
                updatePreview();
            });
        });
    };

    setupIconPickers('primary-icon-picker', (icon) => { selectedPrimaryIcon = icon; });
    setupIconPickers('button-icon-picker', (icon) => { selectedButtonIcon = icon; });

    // --- HTML 工具列邏輯 ---
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const textareaId = btn.parentNode.nextElementSibling.id;
            const textarea = document.getElementById(textareaId);
            
            if (btn.classList.contains('btn-clear')) {
                // 移除格式 (Regex 移除 HTML 標籤)
                textarea.value = textarea.value.replace(/<\/?[^>]+(>|$)/g, "");
                updatePreview();
                return;
            }

            const tag = btn.getAttribute('data-tag');
            const startPos = textarea.selectionStart;
            const endPos = textarea.selectionEnd;
            const text = textarea.value;
            const selectedText = text.substring(startPos, endPos);
            
            let replacement;
            if (tag === 'br') {
                replacement = '<br>\n';
            } else {
                replacement = `<${tag}>${selectedText}</${tag}>`;
            }
            
            textarea.value = text.substring(0, startPos) + replacement + text.substring(endPos);
            textarea.focus();
            const newCursorPos = startPos + replacement.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            
            updatePreview();
        });
    });

    // --- Modal 邏輯 (替換原本的 alert) ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');

    const showModal = (content) => {
        // 先處理文字中的 \n 為 <br>，並保留原始 HTML
        const formattedContent = content.replace(/\\n/g, '<br>');
        modalBody.innerHTML = formattedContent;
        modalOverlay.classList.add('active');
    };

    const hideModal = () => {
        modalOverlay.classList.remove('active');
    };

    modalClose.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModal();
    });

    // 初始化一次預覽
    updatePreview();

    // 處理圖片上傳
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            mascotFile = file;
            
            // 抓取副檔名
            const parts = file.name.split('.');
            mascotExt = '.' + parts[parts.length - 1];

            document.getElementById('file-name').innerText = file.name;

            // 預覽圖片
            const reader = new FileReader();
            reader.onload = (e) => {
                mascotBase64 = e.target.result;
                preMascot.src = mascotBase64;
            };
            reader.readAsDataURL(file);
        }
    });

    // 萬一點到了，預覽自訂的嘲諷台詞 (使用自訂 Modal)
    preBtn.addEventListener('click', () => { 
        showModal(inAlert.value); 
    });

    // --- 讓預覽畫面吉祥物可以拖曳 ---
    let isPreviewDragging = false, previewOffsetX, previewOffsetY;
    
    const startPreviewDrag = (e) => {
        const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const pageY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
        isPreviewDragging = true;
        const rect = preMascot.getBoundingClientRect();
        previewOffsetX = pageX - (rect.left + window.scrollX);
        previewOffsetY = pageY - (rect.top + window.scrollY);
        preMascot.style.cursor = 'grabbing';
        if(e.type === 'mousedown') e.preventDefault();
    };

    const dragPreview = (e) => {
        if (!isPreviewDragging) return;
        const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const pageY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
        
        const frameRect = previewFrame.getBoundingClientRect();
        const framePageX = frameRect.left + window.scrollX;
        const framePageY = frameRect.top + window.scrollY;
        
        let newX = pageX - framePageX - previewOffsetX;
        let newY = pageY - framePageY - previewOffsetY;
        
        preMascot.style.bottom = 'auto';
        preMascot.style.left = Math.max(0, Math.min(newX, previewFrame.clientWidth - preMascot.offsetWidth)) + 'px';
        preMascot.style.top = Math.max(0, Math.min(newY, previewFrame.clientHeight - preMascot.offsetHeight)) + 'px';
    };

    const stopPreviewDrag = () => { isPreviewDragging = false; preMascot.style.cursor = 'grab'; };

    preMascot.addEventListener('mousedown', startPreviewDrag);
    document.addEventListener('mousemove', dragPreview);
    document.addEventListener('mouseup', stopPreviewDrag);
    preMascot.addEventListener('touchstart', startPreviewDrag, { passive: false });
    document.addEventListener('touchmove', dragPreview, { passive: false });
    document.addEventListener('touchend', stopPreviewDrag);

    // --- 讓生成器全域吉祥物可以拖曳 ---
    const sysMascot = document.getElementById('system-mascot');
    let isSysDragging = false, sysOffsetX, sysOffsetY;
    
    const startSysDrag = (e) => {
        const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const pageY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
        isSysDragging = true;
        const rect = sysMascot.getBoundingClientRect();
        sysOffsetX = pageX - (rect.left + window.scrollX);
        sysOffsetY = pageY - (rect.top + window.scrollY);
        sysMascot.style.cursor = 'grabbing';
        if(e.type === 'mousedown') e.preventDefault();
    };

    const dragSys = (e) => {
        if (!isSysDragging) return;
        const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const pageY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
        
        // 確保不會被拖出瀏覽器視窗外
        let newX = pageX - sysOffsetX;
        let newY = pageY - sysOffsetY;
        
        const maxScrollY = Math.max(document.body.scrollHeight, window.innerHeight);
        
        sysMascot.style.bottom = 'auto';
        sysMascot.style.left = Math.max(0, Math.min(newX, document.body.scrollWidth - sysMascot.offsetWidth)) + 'px';
        sysMascot.style.top = Math.max(0, Math.min(newY, maxScrollY - sysMascot.offsetHeight)) + 'px';
    };

    const stopSysDrag = () => { isSysDragging = false; sysMascot.style.cursor = 'grab'; };

    sysMascot.addEventListener('mousedown', startSysDrag);
    document.addEventListener('mousemove', dragSys);
    document.addEventListener('mouseup', stopSysDrag);
    sysMascot.addEventListener('touchstart', startSysDrag, { passive: false });
    document.addEventListener('touchmove', dragSys, { passive: false });
    document.addEventListener('touchend', stopSysDrag);

    // --- 打包邏輯核心 ---
    const form = document.getElementById('generator-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 將 alert 訊息處理
        const safeAlertMsg = inAlert.value.replace(/\n/g, '<br>').replace(/'/g, "\\'");
        
        // 取得主題設定
        const theme = THEMES[inThemeSelect.value] || THEMES.cyberpunk;
        const themeCol = theme.primary;
        const themeColEnd = adjustColor(themeCol, -20);
        const accentCol = theme.accent;
        const accentColEnd = adjustColor(accentCol, -30);
        const orb1Col = theme.orb1;
        const orb2Col = theme.orb2;
        const diffLevel = theme.diff;

        // 1. 建立 JSZip 實例
        const zip = new JSZip();

        // 2. 準備假網站的 HTML 模板
        const exportedHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>活動驚喜</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+TC:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="background-effects">
       <div class="glow-orb orb-1"></div>
       <div class="glow-orb orb-2"></div>
    </div>
    <main class="container">
        <div class="glass-card" id="prank-card">
            <h1><i class="fa-solid ${selectedPrimaryIcon} pulse-icon"></i> ${inTitle.value}</h1>
            <p>${inContent.value}</p>
            <div class="button-area">
                <button id="runaway-btn" class="glow-btn">
                    <i class="fa-solid ${selectedButtonIcon}"></i> ${inBtn.value}
                </button>
            </div>
        </div>
    </main>

    <!-- Custom Modal -->
    <div id="modal-overlay" class="modal-overlay">
        <div class="modal-content">
            <div id="modal-body">${safeAlertMsg}</div>
            <button type="button" id="modal-close" class="modal-btn">
                <i class="fa-solid fa-check"></i> 朕知道了
            </button>
        </div>
    </div>

    <img src="image/mascot${mascotExt}" id="mascot" class="mascot" draggable="false" alt="Mascot">
    <footer>
        <p>${inCopy.value}</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>`;

        // 3. 準備跑酷與拖曳的 CSS 模板 (注入客製化色彩與 Modal 樣式)
        const exportedCss = `* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
    --primary-color: ${themeCol};
    --primary-color-end: ${themeColEnd};
    --accent-color: ${accentCol};
    --accent-color-end: ${accentColEnd};
    --orb-1-color: ${orb1Col};
    --orb-2-color: ${orb2Col};
}
body { font-family: 'Inter', 'Noto Sans TC', sans-serif; background-color: #0b0f19; color: #ffffff; overflow: hidden; height: 100vh; display: flex; justify-content: center; align-items: center; position: relative; }
.background-effects { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; }
.glow-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.6; animation: slowDrift 20s infinite alternate; }
.orb-1 { width: 300px; height: 300px; background: var(--orb-1-color); top: -50px; left: -50px; }
.orb-2 { width: 400px; height: 400px; background: var(--orb-2-color); bottom: -100px; right: -100px; }
@keyframes slowDrift { from { transform: translate(0, 0); } to { transform: translate(50px, 50px); } }
.glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); width: 100%; max-width: 500px; z-index: 10; }
h1 { font-size: 2rem; margin-bottom: 20px; color: var(--primary-color); text-shadow: 0 0 10px rgba(0, 255, 255, 0.3); }
p { font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px; color: #e2e8f0; }
.button-area { min-height: 60px; position: relative; display: flex; justify-content: center; align-items: center; }
.glow-btn { background: linear-gradient(135deg, var(--primary-color), var(--primary-color-end)); color: white; font-family: inherit; font-size: 1.2rem; font-weight: 700; padding: 15px 30px; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 0 15px rgba(0, 242, 254, 0.6); transition: left 0.1s ease-out, top 0.1s ease-out, box-shadow 0.3s; user-select: none; white-space: nowrap; }
.running-absolute { position: absolute !important; z-index: 999; }
.pulse-icon { animation: pulse 2s infinite; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); color: var(--accent-color); text-shadow: 0 0 15px var(--accent-color);} 100% { transform: scale(1); } }
footer { position: absolute; bottom: 0; width: 100%; text-align: center; padding: 15px 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.5); background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.05); z-index: 5; }
.mascot { position: absolute; left: 20px; bottom: 60px; width: 180px; cursor: grab; z-index: 50; user-select: none; -webkit-user-drag: none; transition: filter 0.3s; }
.mascot:active { cursor: grabbing; }
.mascot:hover { animation: neonShake 0.4s infinite alternate; filter: drop-shadow(0 0 15px var(--primary-color)) drop-shadow(0 0 30px var(--accent-color)); }
@keyframes neonShake { 0%, 50%, 100% { transform: rotate(0deg) scale(1.05); } 25% { transform: rotate(5deg) scale(1.05); } 75% { transform: rotate(-5deg) scale(1.05); } }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 10000; padding: 20px; }
.modal-overlay.active { display: flex; }
.modal-content { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 2px solid var(--primary-color); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; text-align: left; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 20px var(--primary-color-end); animation: modalIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
@keyframes modalIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
#modal-body { font-size: 1.25rem; line-height: 1.8; color: #f8fafc; margin-bottom: 30px; }
#modal-body strong { color: var(--primary-color); font-weight: 800; }
#modal-body em { color: var(--accent-color); font-style: italic; }
#modal-body mark { background: var(--primary-color); color: #000; padding: 0 4px; border-radius: 4px; }
.modal-btn { width: 100%; background: linear-gradient(135deg, var(--accent-color), var(--accent-color-end)); color: white; border: none; padding: 15px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: transform 0.2s; }
.modal-btn:hover { transform: scale(1.02); }`;

        // 4. 準備跑酷 JS 邏輯，並注入客製化的難度
        const exportedJs = `document.addEventListener('DOMContentLoaded', () => {
    const runawayBtn = document.getElementById('runaway-btn');
    const difficulty = ${diffLevel}; 
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');

    const moveButton = () => {
        if (!runawayBtn.classList.contains('running-absolute')) {
            const rect = runawayBtn.getBoundingClientRect();
            runawayBtn.classList.add('running-absolute');
            document.body.appendChild(runawayBtn);
            runawayBtn.style.left = rect.left + 'px';
            runawayBtn.style.top = rect.top + 'px';
            void runawayBtn.offsetWidth;
        }
        const margin = 20 + (difficulty * 5); 
        const maxX = window.innerWidth - runawayBtn.offsetWidth - margin;
        const maxY = window.innerHeight - runawayBtn.offsetHeight - margin;
        runawayBtn.style.left = Math.max(margin, Math.floor(Math.random() * maxX)) + 'px';
        runawayBtn.style.top = Math.max(margin, Math.floor(Math.random() * maxY)) + 'px';
        const speed = Math.max(0.05, 0.3 - (difficulty * 0.02));
        runawayBtn.style.transition = \`left \${speed}s ease-out, top \${speed}s ease-out\`;
    };

    runawayBtn.addEventListener('mouseover', moveButton);
    runawayBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveButton(); });
    runawayBtn.addEventListener('click', () => { 
        modalOverlay.classList.add('active');
    });

    modalClose.addEventListener('click', () => { modalOverlay.classList.remove('active'); });

    const mascot = document.getElementById('mascot');
    let isDragging = false, offsetX, offsetY;
    const startDrag = (e) => {
        const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const pageY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
        isDragging = true;
        const rect = mascot.getBoundingClientRect();
        offsetX = pageX - (rect.left + window.scrollX);
        offsetY = pageY - (rect.top + window.scrollY);
        mascot.style.cursor = 'grabbing';
        if(e.type === 'mousedown') e.preventDefault();
    };
    const drag = (e) => {
        if (!isDragging) return;
        const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const pageY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
        mascot.style.bottom = 'auto';
        const maxScrollY = Math.max(document.body.scrollHeight, window.innerHeight);
        mascot.style.left = Math.max(0, Math.min(pageX - offsetX, document.body.scrollWidth - mascot.offsetWidth)) + 'px';
        mascot.style.top = Math.max(0, Math.min(pageY - offsetY, maxScrollY - mascot.offsetHeight)) + 'px';
    };
    const stopDrag = () => { isDragging = false; mascot.style.cursor = 'grab'; };
    mascot.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    mascot.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);
});`;

        // 將檔案裝入 zip
        zip.file("index.html", exportedHtml);
        zip.file("style.css", exportedCss);
        zip.file("script.js", exportedJs);

        // 建立 image 資料夾
        const imgFolder = zip.folder("image");

        try {
            if (mascotFile) {
                // 用戶有上傳檔案
                imgFolder.file(`mascot${mascotExt}`, mascotFile);
            } else {
                // 用戶沒有上傳，嘗試抓取專案預設的 LiyuChillGuy.svg
                const response = await fetch('image/LiyuChillGuy.svg');
                if(!response.ok) throw new Error("Fetch failed");
                const blob = await response.blob();
                imgFolder.file(`mascot.svg`, blob);
            }

            // 觸發打包與下載
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "prank-site.zip");
            
            // 提醒成功
            alert('專屬整人網站已成功打包下載！\n請解壓縮資料夾後，將裡面的 index.html 點開即可！');
        } catch(err) {
            console.error(err);
            alert('打包過程中發生錯誤，請確認您是否有上傳圖片！');
        }
    });
});
