/**
 * 100均特化版「段ボールハウスを飾り付けよう」Webアプリ
 * iPad (Safari) 最適化・ダイソー / セリア連携 ＆ 複数ワークシート対応
 */

// ==================== 効果音システム (Web Audio API) ====================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

document.addEventListener('touchstart', () => getAudioContext(), { once: true });
document.addEventListener('click', () => getAudioContext(), { once: true });

function playTapSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.35, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
    });
  } catch (e) {}
}

function playWarningSound() {
  try {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, ctx.currentTime);
    osc2.frequency.setValueAtTime(233.08, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

function playFanfareSound() {
  try {
    const ctx = getAudioContext();
    const chord = [
      { f: 523.25, t: 0.0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 523.25, t: 0.3, d: 0.15 },
      { f: 659.25, t: 0.45, d: 0.35 },
      { f: 783.99, t: 0.8, d: 0.35 },
      { f: 1046.50, t: 1.15, d: 0.8 }
    ];
    chord.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + n.t);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.t);
      osc.stop(ctx.currentTime + n.t + n.d);
    });
  } catch (e) {}
}

// ==================== 状態管理 (State) ====================
const state = {
  currentStep: 1,
  selectedPlace: HOUSE_PLACES[0],        // やね
  selectedItemType: ITEM_TYPES[0],       // しーる
  selectedStore: STORE_LIST[0],          // ダイソー
  customSearchWord: '',
  selectedPrice: 110,
  capturedItem: null,
  album: [],
  // 複数シート管理（各シートに2スロット固定）
  sheets: [
    [null, null]
  ],
  currentSheetIndex: 0,
  studentName: '',
  targetSlot: null,                      // { sheetIdx, slotIdx }
  keyboardTarget: 'search',
  settings: { ...DEFAULT_SETTINGS },
  completedSheetImages: []
};

// ==================== 初期化 ====================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
  renderPlaceGrid();
  setupEventListeners();
  updateWorksheetUI();
});

// ==================== 設定の読み書き (localStorage) ====================
function loadSavedSettings() {
  try {
    const saved = localStorage.getItem('shopping_app_settings');
    if (saved) {
      state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {}
  applySettingsToUI();
}

function saveCurrentSettings(newSettings) {
  state.settings = { ...state.settings, ...newSettings };
  try {
    localStorage.setItem('shopping_app_settings', JSON.stringify(state.settings));
  } catch (e) {}
  applySettingsToUI();
  updateWorksheetUI();
}

function applySettingsToUI() {
  document.getElementById('badgeMaxCount').textContent = state.settings.maxCount;
  document.getElementById('badgeMaxPrice').textContent = state.settings.maxPrice;
  document.getElementById('sheetCondCount').textContent = state.settings.maxCount;
  document.getElementById('sheetCondPrice').textContent = state.settings.maxPrice;

  // 設定モーダル内の選択状態
  document.querySelectorAll('#settingPriceOptions .btn-setting-chip').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.val) === state.settings.maxPrice);
  });
  document.getElementById('settingCustomPrice').value = state.settings.maxPrice;

  document.querySelectorAll('#settingCountOptions .btn-setting-chip').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.val) === state.settings.maxCount);
  });
  document.getElementById('settingCustomCount').value = state.settings.maxCount;
}

// ==================== イベントリスナー設定 ====================
function setupEventListeners() {
  // ステップインジケータークリック
  for (let i = 1; i <= 6; i++) {
    const chip = document.getElementById(`chipStep${i}`);
    if (chip) {
      chip.addEventListener('click', () => {
        if (i <= state.currentStep || (i === 5 && state.sheets[0].some(s => s !== null))) {
          goToStep(i);
        }
      });
    }
  }

  // ヘッダーアクション
  document.getElementById('btnHeaderSettings').addEventListener('click', openSettingsModal);
  document.getElementById('btnCloseSettings').addEventListener('click', closeSettingsModal);
  document.getElementById('btnSaveSettings').addEventListener('click', handleSaveSettingsFromModal);

  document.getElementById('btnHeaderAlbum').addEventListener('click', () => openAlbumModal(null));
  document.getElementById('btnCloseAlbum').addEventListener('click', closeAlbumModal);

  // 戻るボタン
  document.getElementById('btnBackToStep1').addEventListener('click', () => goToStep(1));
  document.getElementById('btnBackToStep2').addEventListener('click', () => goToStep(2));

  // ステップ③：お店ボタン（ダイソー / セリア）
  document.getElementById('btnStoreDaiso').addEventListener('click', () => {
    handleStoreSelected(STORE_LIST[0]);
  });
  document.getElementById('btnStoreSeria').addEventListener('click', () => {
    handleStoreSelected(STORE_LIST[1]);
  });

  // 検索ワード編集ボタン
  document.getElementById('btnEditSearchWord').addEventListener('click', () => {
    openKeyboardModal('search');
  });

  // スクショ選択ボタン ＆ ファイルアップロード
  const btnUpload = document.getElementById('btnUploadScreenshot');
  const fileInput = document.getElementById('fileUploadInput');
  btnUpload.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelected);

  document.getElementById('btnAlbumUploadPhoto').addEventListener('click', () => fileInput.click());

  // ステップ④：きりとり ＆ 値段設定
  document.getElementById('btnLaunchCrop').addEventListener('click', openCropModal);
  document.getElementById('btnCloseCropModal').addEventListener('click', closeCropModal);
  document.getElementById('btnCancelCrop').addEventListener('click', closeCropModal);
  document.getElementById('btnConfirmCrop').addEventListener('click', confirmCropSelection);
  document.getElementById('btnCropSmaller').addEventListener('click', () => resizeCropBox(-0.15));
  document.getElementById('btnCropLarger').addEventListener('click', () => resizeCropBox(0.15));
  document.getElementById('btnCropCenter').addEventListener('click', centerCropBox);
  setupCropDragHandlers();

  // 価格オプション選択ボタンスイッチ
  document.querySelectorAll('.btn-price-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playTapSound();
      document.querySelectorAll('.btn-price-option').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.selectedPrice = parseInt(e.currentTarget.dataset.price);
    });
  });

  document.getElementById('btnRetakeItem').addEventListener('click', () => goToStep(3));
  document.getElementById('btnAddAlbum').addEventListener('click', handleAddCapturedToAlbum);

  // ステップ⑤：ワークシート操作
  document.getElementById('btnAddAnotherSheet').addEventListener('click', handleAddAnotherSheet);
  document.getElementById('btnFindMoreItems').addEventListener('click', () => goToStep(1));
  document.getElementById('btnCompleteDone').addEventListener('click', handleCompleteDone);

  document.querySelectorAll('.btn-slot-choose').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slotIdx = parseInt(e.currentTarget.dataset.slot);
      openAlbumModal({ sheetIdx: state.currentSheetIndex, slotIdx });
    });
  });

  document.getElementById('nameBannerBox').addEventListener('click', () => openKeyboardModal('name'));

  // ステップ⑥：完成画面アクション
  document.getElementById('btnDownloadAllSheets').addEventListener('click', handleDownloadAllSheets);
  document.getElementById('btnBackToWorksheet').addEventListener('click', () => goToStep(5));
  document.getElementById('btnRestartApp').addEventListener('click', handleRestartApp);

  // 五十音キーボード操作
  document.getElementById('btnKbClear').addEventListener('click', () => {
    document.getElementById('keyboardPreviewText').textContent = '';
  });
  document.getElementById('btnKbDelete').addEventListener('click', () => {
    const cur = document.getElementById('keyboardPreviewText').textContent;
    document.getElementById('keyboardPreviewText').textContent = cur.slice(0, -1);
  });
  document.getElementById('btnKbSubmit').addEventListener('click', handleKeyboardSubmit);

  // アラートOKボタン
  document.getElementById('btnAlertOk').addEventListener('click', () => {
    document.getElementById('alertPopupOverlay').classList.remove('active');
  });

  // 設定モーダルのチップスイベント
  document.querySelectorAll('#settingPriceOptions .btn-setting-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playTapSound();
      document.querySelectorAll('#settingPriceOptions .btn-setting-chip').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      document.getElementById('settingCustomPrice').value = e.currentTarget.dataset.val;
    });
  });
  document.querySelectorAll('#settingCountOptions .btn-setting-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playTapSound();
      document.querySelectorAll('#settingCountOptions .btn-setting-chip').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      document.getElementById('settingCustomCount').value = e.currentTarget.dataset.val;
    });
  });
}

// ==================== ステップ切り替え ====================
function goToStep(stepNum) {
  state.currentStep = stepNum;
  playTapSound();

  document.querySelectorAll('.step-view').forEach(v => v.classList.remove('active'));
  document.getElementById(`viewStep${stepNum}`).classList.add('active');

  for (let i = 1; i <= 6; i++) {
    const chip = document.getElementById(`chipStep${i}`);
    if (!chip) continue;
    chip.classList.remove('active');
    if (i < stepNum) {
      chip.classList.add('completed');
    } else {
      chip.classList.remove('completed');
    }
  }
  const currentChip = document.getElementById(`chipStep${stepNum}`);
  if (currentChip) currentChip.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (stepNum === 3) {
    prepareStep3();
  } else if (stepNum === 5) {
    updateWorksheetUI();
  }
}

// ==================== ステップ①：場所選択（大項目・5分類） ====================
function renderPlaceGrid() {
  const container = document.getElementById('placeGrid');
  container.innerHTML = '';

  HOUSE_PLACES.forEach(place => {
    const card = document.createElement('div');
    card.className = 'place-card';
    card.style.background = place.bg;
    card.style.borderColor = place.color + '44';

    card.innerHTML = `
      <div class="place-card-icon">${place.icon}</div>
      <div class="place-card-title" style="color: ${place.color};">${place.name}</div>
      <div class="place-card-desc">${place.desc}</div>
    `;

    card.addEventListener('click', () => {
      playTapSound();
      selectPlace(place);
    });

    container.appendChild(card);
  });
}

function selectPlace(place) {
  state.selectedPlace = place;
  document.getElementById('activePlaceBadge').innerHTML = `${place.icon} ${place.name}`;
  document.getElementById('step3PlaceBadge').innerHTML = `${place.icon} ${place.name}`;
  renderItemTypeGrid();
  goToStep(2);
}

// ==================== ステップ②：種類選択（中項目・6分類） ====================
function renderItemTypeGrid() {
  const container = document.getElementById('itemTypeGrid');
  container.innerHTML = '';

  ITEM_TYPES.forEach(itemType => {
    const card = document.createElement('div');
    card.className = 'item-type-card';

    card.innerHTML = `
      <div class="item-type-icon">${itemType.icon}</div>
      <div class="item-type-title">${itemType.name}</div>
    `;

    card.addEventListener('click', () => {
      playTapSound();
      selectItemType(itemType);
    });

    container.appendChild(card);
  });
}

function selectItemType(itemType) {
  state.selectedItemType = itemType;
  document.getElementById('step3TypeBadge').innerHTML = `${itemType.icon} ${itemType.name}`;

  if (itemType.id === 'custom') {
    openKeyboardModal('search');
  } else {
    state.customSearchWord = itemType.searchKeyword;
    goToStep(3);
  }
}

// ==================== ステップ③：お店選択 ＆ Google画像検索 ====================
function prepareStep3() {
  const wordDisplay = document.getElementById('searchWordPreview');
  const queryText = state.customSearchWord || (state.selectedItemType ? state.selectedItemType.searchKeyword : '');
  wordDisplay.textContent = queryText.trim();

  // スクショボタンのリセット
  const uploadBtn = document.getElementById('btnUploadScreenshot');
  uploadBtn.classList.remove('highlight');
  document.getElementById('uploadBtnLabel').textContent = 'iPadで とった すくしょ（しゃしん）をつかう！';

  // おすすめヒントチップスの描画
  renderSampleChips();
}

function renderSampleChips() {
  const container = document.getElementById('sampleChipsContainer');
  container.innerHTML = '';

  const samples = state.selectedItemType.sampleItems || [];
  if (samples.length === 0) {
    container.innerHTML = '<span style="color:#868e96; font-weight:700;">うえの ダイソー または セリアを おして さがしてね！</span>';
    return;
  }

  samples.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sample-chip-btn';
    chip.innerHTML = `
      <span>${item.name}</span>
      <span class="chip-price-badge">${item.price}えん</span>
    `;

    chip.addEventListener('click', () => {
      playTapSound();
      state.customSearchWord = item.query;
      document.getElementById('searchWordPreview').textContent = state.customSearchWord;
      // どちらかの店舗で自動検索
      handleStoreSelected(state.selectedStore || STORE_LIST[0]);
    });

    container.appendChild(chip);
  });
}

function handleStoreSelected(store) {
  playTapSound();
  state.selectedStore = store;

  // Google画像検索のキーワード構築（大項目の場所は含めず、アイテム種類と店舗名で検索）
  const baseWord = state.customSearchWord || (state.selectedItemType ? state.selectedItemType.searchKeyword : '');
  const finalQuery = `${store.searchPrefix} ${baseWord} 画像`.trim();

  const googleUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(finalQuery)}`;
  window.open(googleUrl, '_blank');

  // アプリ側のスクショボタンをオレンジ色にピカピカ点滅
  const uploadBtn = document.getElementById('btnUploadScreenshot');
  uploadBtn.classList.add('highlight');
  document.getElementById('uploadBtnLabel').innerHTML = `📸 <strong>「${store.name}の かざり」</strong>の すくしょを とったら ここを おしてね！`;
  document.getElementById('step3GuideText').textContent = `Googleで すくしょ（しゃしん）を とったら、したの ぼたんを おしてね！`;
}

// ==================== iPad写真（スクショ）読み込み処理 ====================
function handleFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;

    const itemName = `${state.selectedStore ? state.selectedStore.name : '100きん'}の ${state.selectedItemType.name.split('・')[0]}`;
    const uploadedItem = {
      id: 'item_' + Date.now(),
      name: itemName,
      placeId: state.selectedPlace.id,
      placeName: state.selectedPlace.name,
      price: state.selectedPrice || 110,
      originalRawUrl: dataUrl,
      imgUrl: dataUrl,
      visualHtml: `<img src="${dataUrl}" alt="${itemName}">`
    };

    // ワークシートのスロットから直接呼ばれた場合
    if (state.targetSlot !== null) {
      closeAlbumModal();
      const albumItem = { ...uploadedItem, albumId: 'album_' + Date.now() };
      state.album.unshift(albumItem);
      updateAlbumBadge();
      pasteItemToSlot(state.targetSlot.sheetIdx, state.targetSlot.slotIdx, albumItem);
      state.targetSlot = null;
      return;
    }

    // ステップ④（切り取り・値段設定）へ進む
    state.capturedItem = uploadedItem;
    prepareStep4(uploadedItem);
    goToStep(4);
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

// ==================== ステップ④：切り取り ＆ お値段設定 ====================
function prepareStep4(item) {
  const container = document.getElementById('cropPreviewContent');
  container.innerHTML = item.visualHtml;

  document.getElementById('cropItemName').textContent = item.name;

  // デフォルト110円にリセット
  state.selectedPrice = 110;
  document.querySelectorAll('.btn-price-option').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.price) === 110);
  });
}

function handleAddCapturedToAlbum() {
  if (!state.capturedItem) return;
  playSuccessSound();

  const albumItem = {
    ...state.capturedItem,
    price: state.selectedPrice,
    albumId: 'album_' + Date.now()
  };

  state.album.unshift(albumItem);
  updateAlbumBadge();

  // 空いているスロットがあれば自動で貼り付け
  autoPasteToFirstAvailableSlot(albumItem);

  goToStep(5);
}

function autoPasteToFirstAvailableSlot(item) {
  for (let sIdx = 0; sIdx < state.sheets.length; sIdx++) {
    for (let slotIdx = 0; slotIdx < 2; slotIdx++) {
      if (state.sheets[sIdx][slotIdx] === null) {
        state.sheets[sIdx][slotIdx] = item;
        state.currentSheetIndex = sIdx;
        return;
      }
    }
  }
}

// ==================== 切り取り（トリミング）モーダル機能 ====================
const cropState = {
  x: 40,
  y: 40,
  size: 200,
  isDragging: false,
  startX: 0,
  startY: 0,
  initBoxX: 0,
  initBoxY: 0
};

function openCropModal() {
  if (!state.capturedItem) return;
  playTapSound();

  const overlay = document.getElementById('cropModalOverlay');
  const img = document.getElementById('cropSourceImage');
  const rawSrc = state.capturedItem.originalRawUrl || state.capturedItem.imgUrl;

  img.onload = () => {
    const wrap = document.getElementById('cropWorkspaceWrap');
    const wrapW = wrap.clientWidth;
    const wrapH = wrap.clientHeight;
    const imgW = img.clientWidth || wrapW;
    const imgH = img.clientHeight || wrapH;

    const baseSize = Math.min(imgW, imgH) * 0.7;
    cropState.size = Math.max(100, Math.min(baseSize, 300));
    cropState.x = (wrapW - cropState.size) / 2;
    cropState.y = (wrapH - cropState.size) / 2;

    updateCropBoxStyle();
  };

  img.src = rawSrc;
  overlay.classList.add('active');
}

function closeCropModal() {
  playTapSound();
  document.getElementById('cropModalOverlay').classList.remove('active');
}

function updateCropBoxStyle() {
  const box = document.getElementById('cropSelectionBox');
  const wrap = document.getElementById('cropWorkspaceWrap');
  if (!box || !wrap) return;

  const maxW = wrap.clientWidth;
  const maxH = wrap.clientHeight;

  if (cropState.size > Math.min(maxW, maxH)) {
    cropState.size = Math.min(maxW, maxH);
  }

  cropState.x = Math.max(0, Math.min(cropState.x, maxW - cropState.size));
  cropState.y = Math.max(0, Math.min(cropState.y, maxH - cropState.size));

  box.style.left = `${cropState.x}px`;
  box.style.top = `${cropState.y}px`;
  box.style.width = `${cropState.size}px`;
  box.style.height = `${cropState.size}px`;
}

function resizeCropBox(deltaPercent) {
  playTapSound();
  const wrap = document.getElementById('cropWorkspaceWrap');
  const delta = Math.min(wrap.clientWidth, wrap.clientHeight) * deltaPercent;
  const newSize = cropState.size + delta;

  if (newSize >= 80 && newSize <= Math.min(wrap.clientWidth, wrap.clientHeight)) {
    cropState.x -= delta / 2;
    cropState.y -= delta / 2;
    cropState.size = newSize;
    updateCropBoxStyle();
  }
}

function centerCropBox() {
  playTapSound();
  const wrap = document.getElementById('cropWorkspaceWrap');
  cropState.x = (wrap.clientWidth - cropState.size) / 2;
  cropState.y = (wrap.clientHeight - cropState.size) / 2;
  updateCropBoxStyle();
}

function setupCropDragHandlers() {
  const box = document.getElementById('cropSelectionBox');
  if (!box) return;

  box.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    box.setPointerCapture(e.pointerId);
    cropState.isDragging = true;
    cropState.startX = e.clientX;
    cropState.startY = e.clientY;
    cropState.initBoxX = cropState.x;
    cropState.initBoxY = cropState.y;
  });

  box.addEventListener('pointermove', (e) => {
    if (!cropState.isDragging) return;
    const dx = e.clientX - cropState.startX;
    const dy = e.clientY - cropState.startY;
    cropState.x = cropState.initBoxX + dx;
    cropState.y = cropState.initBoxY + dy;
    updateCropBoxStyle();
  });

  const onPointerUp = (e) => {
    if (cropState.isDragging) {
      cropState.isDragging = false;
      try { box.releasePointerCapture(e.pointerId); } catch(err){}
    }
  };
  box.addEventListener('pointerup', onPointerUp);
  box.addEventListener('pointercancel', onPointerUp);
}

function confirmCropSelection() {
  playSuccessSound();
  const img = document.getElementById('cropSourceImage');
  const wrap = document.getElementById('cropWorkspaceWrap');

  const imgRect = img.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();

  const imgOffsetLeft = imgRect.left - wrapRect.left;
  const imgOffsetTop = imgRect.top - wrapRect.top;

  const relX = cropState.x - imgOffsetLeft;
  const relY = cropState.y - imgOffsetTop;

  const scale = img.naturalWidth / img.clientWidth;

  const sourceX = Math.max(0, relX * scale);
  const sourceY = Math.max(0, relY * scale);
  const sourceSize = Math.max(10, cropState.size * scale);

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    img,
    sourceX, sourceY, sourceSize, sourceSize,
    0, 0, canvas.width, canvas.height
  );

  const croppedDataUrl = canvas.toDataURL('image/png');

  state.capturedItem.imgUrl = croppedDataUrl;
  state.capturedItem.visualHtml = `<img src="${croppedDataUrl}" alt="${state.capturedItem.name}">`;

  document.getElementById('cropPreviewContent').innerHTML = state.capturedItem.visualHtml;
  document.getElementById('cropModalOverlay').classList.remove('active');
}

// ==================== ステップ⑤：ワークシート ＆ 複数シート管理 ====================
function updateWorksheetUI() {
  renderSheetTabs();
  renderCurrentSheet();
  updateConditionMeters();

  const nameValEl = document.getElementById('nameDisplayVal');
  if (state.studentName) {
    nameValEl.textContent = state.studentName;
    nameValEl.style.color = '#1c7ed6';
  } else {
    nameValEl.textContent = '（おして いれる）';
    nameValEl.style.color = '#adb5bd';
  }
}

function renderSheetTabs() {
  const container = document.getElementById('sheetTabsList');
  container.innerHTML = '';

  state.sheets.forEach((sheet, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `sheet-tab-btn ${idx === state.currentSheetIndex ? 'active' : ''}`;
    btn.textContent = `シート${idx + 1} (${(sheet[0]?1:0)+(sheet[1]?1:0)}/2)`;

    btn.addEventListener('click', () => {
      playTapSound();
      state.currentSheetIndex = idx;
      updateWorksheetUI();
    });

    container.appendChild(btn);
  });
}

function handleAddAnotherSheet() {
  playSuccessSound();
  state.sheets.push([null, null]);
  state.currentSheetIndex = state.sheets.length - 1;
  updateWorksheetUI();
}

function renderCurrentSheet() {
  const currentSheet = state.sheets[state.currentSheetIndex] || [null, null];
  document.getElementById('currentSheetBadgeTitle').textContent = `（${state.currentSheetIndex + 1}まいめ）`;

  const offset = state.currentSheetIndex * 2;
  renderSlotUI(1, currentSheet[0], offset + 1);
  renderSlotUI(2, currentSheet[1], offset + 2);
}

function renderSlotUI(slotNum, item, itemOrderNum) {
  const el = document.getElementById(`slot${slotNum}`);
  const slotIdx = slotNum - 1;

  if (!item) {
    el.className = 'snack-slot-item';
    el.innerHTML = `
      <div class="slot-empty-prompt">
        <span class="icon">➕</span>
        <span>${itemOrderNum}こめ</span>
        <button class="btn-slot-choose" data-slot="${slotIdx}">しゃしんを えらぶ</button>
      </div>
    `;
    el.querySelector('.btn-slot-choose').addEventListener('click', () => {
      openAlbumModal({ sheetIdx: state.currentSheetIndex, slotIdx });
    });
  } else {
    el.className = 'snack-slot-item filled';
    el.innerHTML = `
      <button class="btn-remove-snack" title="はずす">✕</button>
      <div class="slot-img-wrap">
        ${item.visualHtml}
      </div>
      <div class="slot-snack-name">${item.name}</div>
      <div class="slot-snack-price">${item.price} えん</div>
    `;
    el.querySelector('.btn-remove-snack').addEventListener('click', (e) => {
      e.stopPropagation();
      removeItemFromSlot(state.currentSheetIndex, slotIdx);
    });
  }
}

function pasteItemToSlot(sheetIdx, slotIdx, item) {
  state.sheets[sheetIdx][slotIdx] = item;
  playSuccessSound();
  updateWorksheetUI();
}

function removeItemFromSlot(sheetIdx, slotIdx) {
  playTapSound();
  state.sheets[sheetIdx][slotIdx] = null;
  updateWorksheetUI();
}

function updateConditionMeters() {
  let totalCount = 0;
  let totalPrice = 0;

  state.sheets.forEach(sheet => {
    sheet.forEach(slot => {
      if (slot) {
        totalCount++;
        totalPrice += slot.price;
      }
    });
  });

  document.getElementById('badgeCurrentCount').textContent = totalCount;
  document.getElementById('badgeTotalPrice').textContent = totalPrice;

  const countPill = document.getElementById('pillCountCondition');
  if (totalCount <= state.settings.maxCount) {
    countPill.className = 'condition-pill ok';
  } else {
    countPill.className = 'condition-pill warn';
  }

  const pricePill = document.getElementById('pillPriceCondition');
  const priceStatus = document.getElementById('priceStatusText');
  if (totalPrice <= state.settings.maxPrice) {
    const remain = state.settings.maxPrice - totalPrice;
    pricePill.className = 'condition-pill ok';
    priceStatus.innerHTML = `（あと ${remain}えん かえるよ⭕）`;
  } else {
    const over = totalPrice - state.settings.maxPrice;
    pricePill.className = 'condition-pill warn';
    priceStatus.innerHTML = `（${over}えん おおいよ！）⚠️ おかねを こえたよ`;
  }
}

// ==================== アルバム管理 ====================
function updateAlbumBadge() {
  document.getElementById('albumCountBadge').textContent = state.album.length;
}

function openAlbumModal(slotTarget) {
  state.targetSlot = slotTarget;
  renderAlbumList();
  document.getElementById('albumModalOverlay').classList.add('active');
  playTapSound();
}

function closeAlbumModal() {
  document.getElementById('albumModalOverlay').classList.remove('active');
}

function renderAlbumList() {
  const grid = document.getElementById('albumItemsGrid');
  grid.innerHTML = '';

  if (state.album.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 40px 10px; color:#868e96; font-weight:800;">
        <div style="font-size:3rem; margin-bottom:10px;">📸</div>
        しゃしんが まだ ないよ！<br>うえの「📁 iPadの かめらろーるから えらぶ」を おすか、<br>おみせで さがして すくしょを とってね！
      </div>
    `;
    return;
  }

  state.album.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'album-item-card';
    card.innerHTML = `
      <div class="album-thumb-wrap">
        ${item.visualHtml}
      </div>
      <div class="album-item-name">${item.name}</div>
      <div class="album-item-price">${item.price}えん</div>
    `;

    card.addEventListener('click', () => {
      handleChooseItemFromAlbum(item);
    });

    grid.appendChild(card);
  });
}

function handleChooseItemFromAlbum(item) {
  playTapSound();
  closeAlbumModal();

  if (state.targetSlot !== null) {
    pasteItemToSlot(state.targetSlot.sheetIdx, state.targetSlot.slotIdx, item);
    state.targetSlot = null;
    return;
  }

  // ターゲット未指定時は現在のシートの空きスロットへ
  const curSheet = state.sheets[state.currentSheetIndex];
  if (curSheet[0] === null) {
    pasteItemToSlot(state.currentSheetIndex, 0, item);
  } else if (curSheet[1] === null) {
    pasteItemToSlot(state.currentSheetIndex, 1, item);
  } else {
    showWarningModal(
      '２こはいっているよ！',
      'このシートは ２こ うまっているよ。\n「📄 もう１まい つくる」を おして つぎのシートに はってね！'
    );
  }
}

// ==================== 「できた！」完成チェック ====================
async function handleCompleteDone() {
  let totalCount = 0;
  let totalPrice = 0;

  state.sheets.forEach(sheet => {
    sheet.forEach(slot => {
      if (slot) {
        totalCount++;
        totalPrice += slot.price;
      }
    });
  });

  if (totalCount === 0) {
    showWarningModal('かざりつけを えらんでね！', 'まだ かざりつけが えらばれていないよ。\nしゃしんを えらんで わーくしーとに はってね。');
    return;
  }

  if (totalCount > state.settings.maxCount) {
    showWarningModal('かずが おおいよ！', `ぜんぶで ${totalCount}こ に なっているよ。\n${state.settings.maxCount}こ までに なるように はずしてね。`);
    return;
  }

  if (totalPrice > state.settings.maxPrice) {
    showWarningModal('おかねを こえちゃったよ！', `ごうけいが ${totalPrice}えん に なっているよ。\n${state.settings.maxPrice}えん までに なるように なおしてね。`);
    return;
  }

  playFanfareSound();
  launchConfetti();

  // 有効なシート（少なくとも1つアイテムが貼られているシート）のみ画像生成
  state.completedSheetImages = [];
  const container = document.getElementById('finalSheetsContainer');
  container.innerHTML = '<div style="color:#1864ab; font-weight:800;">わーくしーとを さくせい中...</div>';

  for (let idx = 0; idx < state.sheets.length; idx++) {
    const sheet = state.sheets[idx];
    if (sheet[0] !== null || sheet[1] !== null) {
      const dataUrl = await generateWorksheetCanvas(idx);
      state.completedSheetImages.push({ sheetIdx: idx, dataUrl });
    }
  }

  container.innerHTML = '';
  state.completedSheetImages.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'final-sheet-preview-card';
    card.innerHTML = `
      <img src="${item.dataUrl}" alt="かんせい わーくしーと ${index + 1}">
    `;
    container.appendChild(card);
  });

  goToStep(6);
}

// ==================== 先生用設定モーダル操作 ====================
function openSettingsModal() {
  playTapSound();
  applySettingsToUI();
  document.getElementById('settingsModalOverlay').classList.add('active');
}

function closeSettingsModal() {
  document.getElementById('settingsModalOverlay').classList.remove('active');
}

function handleSaveSettingsFromModal() {
  playSuccessSound();
  const customPrice = parseInt(document.getElementById('settingCustomPrice').value) || 500;
  const customCount = parseInt(document.getElementById('settingCustomCount').value) || 4;

  saveCurrentSettings({
    maxPrice: customPrice,
    maxCount: customCount
  });

  closeSettingsModal();
}

// ==================== 五十音ソフトキーボード ====================
const KANA_TABLE = [
  'あ','い','う','え','お',  'か','き','く','け','こ',
  'さ','し','す','せ','そ',  'た','ち','つ','て','と',
  'な','に','ぬ','ね','の',  'は','ひ','ふ','へ','ほ',
  'ま','み','む','め','も',  'や','（','ゆ','）','よ',
  'ら','り','る','れ','ろ',  'わ','を','ん','ー','っ',
  'が','ぎ','ぐ','げ','ご',  'ざ','じ','ず','ぜ','ぞ',
  'だ','ぢ','づ','で','ど',  'ば','び','ぶ','べ','ぼ',
  'ぱ','ぴ','ぷ','ぺ','ぽ',  'ゃ','ゅ','ょ','・',' '
];

function openKeyboardModal(target) {
  state.keyboardTarget = target;
  const overlay = document.getElementById('keyboardModalOverlay');
  const title = document.getElementById('keyboardModalTitle');
  const preview = document.getElementById('keyboardPreviewText');
  const grid = document.getElementById('kanaKeyboardGrid');

  if (target === 'search') {
    title.textContent = '🔍 かいたいものの なまえを えらんでね';
    preview.textContent = state.customSearchWord || '';
  } else {
    title.textContent = '✏️ あなたの なまえを えらんでね';
    preview.textContent = state.studentName || '';
  }

  grid.innerHTML = '';
  KANA_TABLE.forEach(char => {
    const btn = document.createElement('button');
    btn.className = 'btn-kana-key';
    btn.textContent = char;
    btn.addEventListener('click', () => {
      playTapSound();
      preview.textContent += char;
    });
    grid.appendChild(btn);
  });

  overlay.classList.add('active');
  playTapSound();
}

function handleKeyboardSubmit() {
  playSuccessSound();
  const text = document.getElementById('keyboardPreviewText').textContent.trim();
  document.getElementById('keyboardModalOverlay').classList.remove('active');

  if (state.keyboardTarget === 'search') {
    state.customSearchWord = text;
    document.getElementById('searchWordPreview').textContent = text;
    goToStep(3);
  } else {
    state.studentName = text;
    updateWorksheetUI();
  }
}

function showWarningModal(title, msg) {
  playWarningSound();
  document.getElementById('alertMsgText').textContent = title;
  document.getElementById('alertSubText').innerText = msg;
  document.getElementById('alertPopupOverlay').classList.add('active');
}

// ==================== ワークシート高画質Canvas生成 (A4プリント対応) ====================
async function generateWorksheetCanvas(sheetIndex) {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');

  // 白背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 背景ドット
  ctx.fillStyle = '#f1f3f5';
  for (let x = 40; x < canvas.width; x += 40) {
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // フレーム枠
  ctx.strokeStyle = '#ced4da';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 12]);
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
  ctx.setLineDash([]);

  // タイトル
  ctx.font = 'bold 74px "Hiragino Maru Gothic ProN", "BIZ UDPGothic", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8590c';
  ctx.fillText('だんボールハウスを　かざりつけよう！', canvas.width / 2, 160);

  // 条件ボックス
  ctx.strokeStyle = '#212529';
  ctx.lineWidth = 5;
  ctx.strokeRect(canvas.width / 2 - 320, 210, 640, 150);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(canvas.width / 2 - 315, 215, 630, 140);

  ctx.textAlign = 'left';
  ctx.font = 'bold 36px "Hiragino Maru Gothic ProN", sans-serif';
  ctx.fillStyle = '#212529';
  ctx.fillText('じょうけん', canvas.width / 2 - 280, 265);
  ctx.fillStyle = '#d6336c';
  ctx.fillText(`①　ぜんぶで　${state.settings.maxCount}こ　まで`, canvas.width / 2 - 280, 325);
  ctx.fillText(`②　ぜんぶで　${state.settings.maxPrice}円　まで`, canvas.width / 2 + 30, 325);

  // 中央黒枠
  const boxX = 140;
  const boxY = 420;
  const boxW = canvas.width - 280;
  const boxH = 950;

  ctx.strokeStyle = '#212529';
  ctx.lineWidth = 8;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // マスキングテープ
  ctx.fillStyle = '#ffd43b';
  ctx.fillRect(canvas.width / 2 - 180, boxY - 30, 360, 60);

  // 枠タイトル
  ctx.textAlign = 'center';
  ctx.font = 'bold 50px "Hiragino Maru Gothic ProN", sans-serif';
  ctx.fillStyle = '#212529';
  ctx.fillText(`100きんで　かいたいもの（${sheetIndex + 1}まいめ）`, canvas.width / 2, boxY + 105);

  const sheet = state.sheets[sheetIndex] || [null, null];
  const item1 = sheet[0];
  const item2 = sheet[1];
  const slotW = (boxW - 120) / 2;
  const slotH = 610;
  const slotY = boxY + 160;
  const baseOrder = sheetIndex * 2;

  await drawSlotToCanvas(ctx, item1, boxX + 40, slotY, slotW, slotH, baseOrder + 1);
  await drawSlotToCanvas(ctx, item2, boxX + 80 + slotW, slotY, slotW, slotH, baseOrder + 2);

  // 全体合計金額バー
  let allTotal = 0;
  state.sheets.forEach(s => s.forEach(slot => { if (slot) allTotal += slot.price; }));

  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(boxX + 40, boxY + boxH - 120, boxW - 80, 80);
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 3;
  ctx.strokeRect(boxX + 40, boxY + boxH - 120, boxW - 80, 80);

  ctx.textAlign = 'center';
  ctx.font = 'bold 38px "Hiragino Maru Gothic ProN", sans-serif';
  ctx.fillStyle = '#d6336c';
  ctx.fillText(`ぜんぶのごうけい：${allTotal} えん（${state.settings.maxPrice}えん いない ⭕）`, canvas.width / 2, boxY + boxH - 68);

  // なまえ枠
  const nameBoxW = 420;
  const nameBoxH = 90;
  const nameBoxX = canvas.width - 140 - nameBoxW;
  const nameBoxY = 1490;

  ctx.strokeStyle = '#212529';
  ctx.lineWidth = 5;
  ctx.strokeRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);

  ctx.textAlign = 'left';
  ctx.font = 'bold 42px "Hiragino Maru Gothic ProN", sans-serif';
  ctx.fillStyle = '#212529';
  ctx.fillText('なまえ', nameBoxX + 24, nameBoxY + 60);

  ctx.font = 'bold 46px "Hiragino Maru Gothic ProN", sans-serif';
  ctx.fillStyle = '#1c7ed6';
  ctx.fillText(state.studentName || '　　　　　', nameBoxX + 170, nameBoxY + 62);

  return canvas.toDataURL('image/png');
}

async function drawSlotToCanvas(ctx, item, x, y, w, h, orderNum) {
  ctx.save();
  if (!item) {
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    ctx.fillStyle = '#868e96';
    ctx.font = 'bold 36px "Hiragino Maru Gothic ProN", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${orderNum}こめ`, x + w / 2, y + h / 2);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#ff922b';
    ctx.lineWidth = 6;
    ctx.strokeRect(x, y, w, h);

    const imgH = h * 0.65;
    const imgX = x + 15;
    const imgY = y + 15;
    const imgW = w - 30;

    if (item.imgUrl) {
      try {
        const img = new Image();
        if (!item.imgUrl.startsWith('data:')) {
          img.crossOrigin = 'anonymous';
        }
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = item.imgUrl;
        });
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
      } catch (e) {}
    }

    ctx.fillStyle = '#212529';
    ctx.font = 'bold 36px "Hiragino Maru Gothic ProN", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, x + w / 2, y + h * 0.78);

    ctx.fillStyle = '#d6336c';
    ctx.font = '900 48px "Hiragino Maru Gothic ProN", sans-serif';
    ctx.fillText(`${item.price} えん`, x + w / 2, y + h * 0.92);
  }
  ctx.restore();
}

function handleDownloadAllSheets() {
  if (state.completedSheetImages.length === 0) return;
  playSuccessSound();

  state.completedSheetImages.forEach((sheetObj, index) => {
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `だんボールハウス_${state.studentName || 'わーくしーと'}_シート${index + 1}.png`;
      link.href = sheetObj.dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, index * 400);
  });
}

function handleRestartApp() {
  playTapSound();
  state.sheets = [[null, null]];
  state.currentSheetIndex = 0;
  state.studentName = '';
  state.capturedItem = null;
  updateWorksheetUI();
  goToStep(1);
}

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#ff6b6b', '#4dabf7', '#ffd43b', '#51cf66', '#f06595', '#cc5de8'];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 12 + 6,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 4 + 2,
      vx: (Math.random() - 0.5) * 3,
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  let frame = 0;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    frame++;
    if (frame < 200) {
      requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  update();
}
