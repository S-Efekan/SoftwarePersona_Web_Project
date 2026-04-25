document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('note-content');
    const ghostDiv = document.getElementById('ghost-div');
    const slashMenu = document.getElementById('slash-menu');
    const menuItems = slashMenu.querySelectorAll('.menu-item');
    
    let isMenuOpen = false;
    let activeIndex = 0;
    let slashIndex = -1; // '/' karakterinin metindeki konumu

    // 1. Textarea'daki stilleri birebir Ghost Div'e kopyala (Senkronizasyon)
    function syncStyles() {
        const styles = window.getComputedStyle(textarea);
        ghostDiv.style.padding = styles.padding;
        ghostDiv.style.fontSize = styles.fontSize;
        ghostDiv.style.lineHeight = styles.lineHeight;
        ghostDiv.style.fontFamily = styles.fontFamily;
        ghostDiv.style.letterSpacing = styles.letterSpacing;
    }
    
    // Uygulama yüklendiğinde bir kere senkronize et
    syncStyles();

    // 2. Klavye Girdilerini Dinle (Slash tespiti ve Menü Kontrolü)
    textarea.addEventListener('keydown', (e) => {
        if (isMenuOpen) {
            // Menü açıkken Aşağı yön tuşu
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % menuItems.length;
                updateMenuHighlight();
            } 
            // Menü açıkken Yukarı yön tuşu
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + menuItems.length) % menuItems.length;
                updateMenuHighlight();
            } 
            // Menü açıkken Enter tuşu (Seçimi uygula)
            else if (e.key === 'Enter') {
                e.preventDefault();
                insertMarkdown(menuItems[activeIndex]);
            } 
            // Menü açıkken Escape tuşu (İptal et)
            else if (e.key === 'Escape') {
                e.preventDefault();
                closeMenu();
            }
            // Backspace basıldığında, '/' karakteri silinirse menüyü kapat
            else if (e.key === 'Backspace' && textarea.selectionStart - 1 === slashIndex) {
                closeMenu();
            }
        }
    });

    // 3. Yazı Yazıldıkça Çalışan Olaylar (Menüyü açma tespiti)
    textarea.addEventListener('input', (e) => {
        const val = textarea.value;
        const cursorPosition = textarea.selectionStart;
        const lastChar = val.slice(cursorPosition - 1, cursorPosition);
        const charBeforeLast = val.slice(cursorPosition - 2, cursorPosition - 1);

        // Kullanıcı '/' yazdıysa ve bu ya satırın başıysa ya da öncesinde boşluk/satır atlama varsa
        if (lastChar === '/' && (charBeforeLast === ' ' || charBeforeLast === '\n' || cursorPosition === 1)) {
            slashIndex = cursorPosition - 1;
            openMenu(cursorPosition);
        } else if (isMenuOpen && cursorPosition < slashIndex) {
            // Kullanıcı '/' karakterinin gerisine giderse menüyü kapat
            closeMenu();
        }
    });

    // Tıklama ile menüyü kapatma (Dışarıya veya textarea'nın başka yerine tıklanırsa)
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !slashMenu.contains(e.target)) {
            closeMenu();
        }
    });

    // 4. Ghost Div ile Koordinat Hesaplama ve Menüyü Açma
    function openMenu(cursorPosition) {
        // Textarea'daki yazının '/' karakterine kadar olan kısmını al
        const textUpToCursor = textarea.value.substring(0, cursorPosition);
        
        // Metni HTML için güvenli hale getir ve satır sonlarını <br>'ye çevir
        const escapedText = textUpToCursor
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');

        // Ghost div'in içine metni ve sonuna işaretçi (marker) span'ı ekle
        ghostDiv.innerHTML = escapedText + '<span id="cursor-marker"></span>';

        const marker = document.getElementById('cursor-marker');
        
        // Marker'ın koordinatlarını al
        // textarea.scrollTop çıkarılarak scroll yapıldığında menünün kayması engellenir
        const top = marker.offsetTop - textarea.scrollTop;
        const left = marker.offsetLeft;

        // Menüyü pozisyonlandır (+25px alt çaprazına yerleştiriyoruz ki yazıyı kapatmasın)
        slashMenu.style.top = `${top + 25}px`;
        slashMenu.style.left = `${left}px`;
        slashMenu.classList.remove('hidden');
        
        isMenuOpen = true;
        activeIndex = 0;
        updateMenuHighlight();
    }

    function closeMenu() {
        slashMenu.classList.add('hidden');
        isMenuOpen = false;
        slashIndex = -1;
    }

    function updateMenuHighlight() {
        menuItems.forEach((item, index) => {
            if (index === activeIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // 5. Araya Ekleme (Insertion) İşlemi
    function insertMarkdown(selectedItem) {
        const mdText = selectedItem.getAttribute('data-md');
        const offset = parseInt(selectedItem.getAttribute('data-offset'));
        
        const val = textarea.value;
        const beforeSlash = val.substring(0, slashIndex);
        const afterSlash = val.substring(textarea.selectionStart);

        // Textarea değerini '/' karakterini silip yerine Markdown kodunu ekleyerek güncelle
        textarea.value = beforeSlash + mdText + afterSlash;

        // İmleci (Cursor) konumlandır. 
        // Örneğin **** eklendiyse, offset 2'dir. İmleci ** arasına (yeni metnin içine) yerleştirir.
        const newCursorPos = beforeSlash.length + offset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();

        closeMenu();
    }

    // Fareyle menüden seçim yapabilme
    menuItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            activeIndex = index;
            updateMenuHighlight();
        });
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdown(item);
        });
    });

    // Scroll edildiğinde ghost div de senkronize kaymalı ki hesap şaşmasın
    textarea.addEventListener('scroll', () => {
        if (isMenuOpen) {
            closeMenu(); // Kaydırırken UX açısından menüyü kapatmak daha iyidir
        }
    });
});