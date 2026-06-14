document.addEventListener("DOMContentLoaded", () => {
    // Jalur Sinkronisasi Input Form ke Preview Kertas
    const inNama = document.getElementById("inNama");
    const inDusun = document.getElementById("inDusun");
    const inDesa = document.getElementById("inDesa");
    const inKecamatan = document.getElementById("inKecamatan");
    const inKabupaten = document.getElementById("inKabupaten");
    const inProvinsi = document.getElementById("inProvinsi");
    const inSalamPembuka = document.getElementById("inSalamPembuka");
    const inPembukaan = document.getElementById("inPembukaan");
    const inPesan = document.getElementById("inPesan");
    const inPenutupan = document.getElementById("inPenutupan");
    const inSalamPenutup = document.getElementById("inSalamPenutup");

    // Target Output Preview
    const suratNama = document.getElementById("suratNama");
    const suratNamaBawah = document.getElementById("suratNamaBawah");
    const suratAlamatKecil = document.getElementById("suratAlamatKecil");
    const suratSalamPembuka = document.getElementById("suratSalamPembuka");
    const suratPembukaan = document.getElementById("suratPembukaan");
    const suratPesan = document.getElementById("suratPesan");
    const suratPenutupan = document.getElementById("suratPenutupan");
    const suratSalamPenutup = document.getElementById("suratSalamPenutup");

    // Fungsi Update Real-time Preview Text
    function updatePreview() {
        suratNama.innerText = inNama.value || "[Nama Lengkap]";
        suratNamaBawah.innerText = inNama.value ? `( ${inNama.value} )` : "( [Nama Lengkap] )";
        
        // Gabungan Alamat Kecil di atas pembatas
        const dusun = inDusun.value || "[Dusun]";
        const desa = inDesa.value || "[Desa]";
        const kec = inKecamatan.value || "[Kecamatan]";
        const kab = inKabupaten.value || "[Kabupaten]";
        const prov = inProvinsi.value || "[Provinsi]";
        suratAlamatKecil.innerText = `Dusun ${dusun}, Desa ${desa}, Kec. ${kec}, Kab. ${kab}, Provinsi ${prov}`;

        suratSalamPembuka.innerText = inSalamPembuka.value || "";
        suratPembukaan.innerText = inPembukaan.value || "[Kalimat Pembukaan]";
        suratPesan.innerText = inPesan.value || "[Isi Pesan Surat Keterangan]";
        suratPenutupan.innerText = inPenutupan.value || "[Kalimat Penutupan]";
        suratSalamPenutup.innerText = inSalamPenutup.value || "";
    }

    // Melampirkan Event Real-time typing
    const inputs = [inNama, inDusun, inDesa, inKecamatan, inKabupaten, inProvinsi, inSalamPembuka, inPembukaan, inPesan, inPenutupan, inSalamPenutup];
    inputs.forEach(input => input.addEventListener("input", updatePreview));

    // --- FITUR UNGHAH LOGO (OPSIONAL + FITUR CLOSE) ---
    const logoInput = document.getElementById("logoInput");
    const logoPreviewContainer = document.getElementById("logoPreviewContainer");
    const logoMiniPreview = document.getElementById("logoMiniPreview");
    const suratLogo = document.getElementById("suratLogo");
    const btnRemoveLogo = document.getElementById("btnRemoveLogo");

    logoInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Tampilkan di mini preview input
                logoMiniPreview.src = e.target.result;
                logoPreviewContainer.classList.remove("hidden");
                // Tampilkan di dalam kertas surat asli
                suratLogo.src = e.target.result;
                suratLogo.classList.remove("hidden");
            }
            reader.readAsDataURL(file);
        }
    });

    btnRemoveLogo.addEventListener("click", () => {
        logoInput.value = ""; // Reset file input
        logoMiniPreview.src = "";
        logoPreviewContainer.classList.add("hidden");
        suratLogo.src = "";
        suratLogo.classList.add("hidden");
    });

    // --- PAD TANDA TANGAN (CORE-CORET CANVAS) ---
    const canvas = document.getElementById("signaturePad");
    const ctx = canvas.getContext("2d");
    const btnClearSig = document.getElementById("btnClearSig");
    const suratTtdImg = document.getElementById("suratTtdImg");
    let drawing = false;

    ctx.strokeStyle = "#000000"; // Tinta hitam untuk surat resmi
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    // Event menggambar untuk PC & HP (Touch)
    function getMousePos(canvasDom, touchOrMouseEvent) {
        const rect = canvasDom.getBoundingClientRect();
        const clientX = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientX : touchOrMouseEvent.clientX;
        const clientY = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientY : touchOrMouseEvent.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function startDrawing(e) {
        drawing = true;
        const pos = getMousePos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        e.preventDefault();
    }

    function draw(e) {
        if (!drawing) return;
        const pos = getMousePos(canvas, e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        e.preventDefault();
        updateTtdToSurat();
    }

    function stopDrawing() {
        drawing = false;
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDrawing);

    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchmove", draw);
    window.addEventListener("touchend", stopDrawing);

    function updateTtdToSurat() {
        const dataURL = canvas.toDataURL();
        suratTtdImg.src = dataURL;
        suratTtdImg.classList.remove("hidden");
    }

    btnClearSig.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        suratTtdImg.src = "";
        suratTtdImg.classList.add("hidden");
    });

    // --- BLOKIR MENU BAWAN BROWSER (ANTI CURANG / ANTI SAVE IMAGE KANAN) ---
    // Diaplikasikan pada area preview surat & container gambar pop-up agar tidak bisa di-"Save Image As" bawaan browser.
    const targetKertas = document.getElementById("suratKertas");
    const hiddenImageContainer = document.getElementById("hiddenImageContainer");

    [targetKertas, hiddenImageContainer].forEach(element => {
        element.addEventListener("contextmenu", (e) => {
            e.preventDefault(); // Memblokir klik kanan / tahan lama di HP
            return false;
        });
    });


    // --- SISTEM MODAL POP-UP ACTION & CONVERT IMAGE ---
    const btnAksi = document.getElementById("btnAksi");
    const actionModal = document.getElementById("actionModal");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnDownloadImg = document.getElementById("btnDownloadImg");
    const btnCetakSurat = document.getElementById("btnCetakSurat");
    
    let imageBlobUrl = null;
    let base64Data = null;

    btnAksi.addEventListener("click", () => {
        // Render element surat menggunakan html2canvas dengan skala tinggi agar tajam
        html2canvas(targetKertas, {
            scale: 2, 
            useCORS: true,
            backgroundColor: "#ffffff"
        }).then(renderedCanvas => {
            base64Data = renderedCanvas.toDataURL("image/png");
            
            // Masukkan gambar ke dalam container modal dengan sistem proteksi CSS agar tidak bisa diclick/disave curang
            hiddenImageContainer.innerHTML = `<img src="${base64Data}" style="width:100%; max-height:200px; object-fit:contain; border:1px solid #333;" alt="Rendered Preview">`;
            
            // Buka Modal Pop-Up
            actionModal.classList.remove("hidden");
        });
    });

    // Tutup Modal
    btnCloseModal.addEventListener("click", () => {
        actionModal.classList.add("hidden");
    });

    // Jalur Unduh File Gambar (.png)
    btnDownloadImg.addEventListener("click", () => {
        if (!base64Data) return;
        const link = document.createElement("a");
        link.download = `Surat_Keterangan_${inNama.value || "Data"}.png`;
        link.href = base64Data;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // --- FITUR AUTOMATIC PRINT BAWAAN HP ---
    btnCetakSurat.addEventListener("click", () => {
        // Membuat jendela cetak bayangan agar yang ter-print murni kertas surat putihnya saja, bukan layout gelap aplikasinya.
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Cetak Surat Keterangan</title>
                <style>
                    body { margin: 0; padding: 20px; background: #fff; color: #000; }
                    .surat-kertas { font-family: 'Times New Roman', serif; padding: 10px; }
                    .header-surat { display: flex; align-items: center; gap: 15px; margin-bottom: 5px; }
                    .logo-surat-area img { max-height: 65px; max-width: 65px; object-fit: contain; }
                    .judul-area { flex-grow: 1; text-align: center; }
                    .judul-surat { font-size: 18px; font-weight: bold; text-transform: uppercase; }
                    .alamat-kecil { font-size: 10px; color: #333; margin-top: 2px; font-style: italic; }
                    .pembatas-surat { border-top: 2px solid #000; border-bottom: 1px solid #000; height: 3px; margin-bottom: 20px; }
                    .isi-surat-container { font-size: 13px; line-height: 1.6; }
                    .salam-pembuka { margin-bottom: 10px; }
                    .text-justified { text-align: justify; margin-bottom: 12px; text-indent: 30px; }
                    .tabel-biodata { width: 100%; margin: 15px 0 15px 30px; font-size: 13px; }
                    .tabel-biodata td { padding: 3px 0; }
                    .footer-surat { margin-top: 40px; display: flex; justify-content: flex-end; }
                    .ttd-box { text-align: center; width: 200px; font-size: 13px; }
                    .space-ttd { height: 70px; display: flex; align-items: center; justify-content: center; }
                    .space-ttd img { max-height: 100%; max-width: 100%; object-fit: contain; }
                    .nama-penandatangan { font-weight: bold; text-decoration: underline; }
                    .hidden { display: none !important; }
                    @page { size: auto; margin: 20mm; }
                </style>
            </head>
            <body>
                <div class="surat-kertas">
                    ${targetKertas.innerHTML}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    });
});
