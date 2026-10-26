/**
 * 100均特化版「段ボールハウスを飾り付けよう」データ定義
 * 知的障害特別支援学校向け・全ひらがな表記対応
 */

// 大項目：ハウスの場所（5分類）
const HOUSE_PLACES = [
  {
    id: 'yane',
    name: 'やね',
    icon: '🏠',
    color: '#e03131',
    bg: '#fff5f5',
    desc: 'やねの かざりつけ'
  },
  {
    id: 'kabe',
    name: 'かべ',
    icon: '🧱',
    color: '#e8590c',
    bg: '#fff4e6',
    desc: 'かべ（そとがわ）の かざりつけ'
  },
  {
    id: 'doa',
    name: 'どあ・まど',
    icon: '🚪',
    color: '#099268',
    bg: '#e6fcf5',
    desc: 'どあ・まどの かざりつけ'
  },
  {
    id: 'heya',
    name: 'へやのなか',
    icon: '🛋️',
    color: '#1971c2',
    bg: '#e7f5ff',
    desc: 'へやの なかの かざりつけ'
  },
  {
    id: 'sonota',
    name: 'そのほか',
    icon: '⭐',
    color: '#9c36b5',
    bg: '#f8f0fc',
    desc: 'にわ・かんばん・じゆうな かざり'
  }
];

// 中項目：アイテムの大まかな種類（6分類）
const ITEM_TYPES = [
  {
    id: 'seal',
    name: 'しーる・すてっかー',
    icon: '🌟',
    searchKeyword: 'シール ステッカー',
    sampleItems: [
      { name: 'きらきら ほしのしーる', price: 110, query: '星 シール' },
      { name: 'おはなの しーる', price: 110, query: '花 シール' },
      { name: 'れんが・かわら しーる', price: 110, query: 'タイル レンガ シール' },
      { name: 'どうぶつ・ぷくぷくしーる', price: 110, query: 'ぷくぷく シール' }
    ]
  },
  {
    id: 'tape',
    name: 'ますきんぐてーぷ・てーぷ',
    icon: '🎀',
    searchKeyword: 'マスキングテープ テープ',
    sampleItems: [
      { name: 'れんががらの てーぷ', price: 110, query: 'レンガ マスキングテープ' },
      { name: 'きらきら らめてーぷ', price: 110, query: 'グリッター ラメ テープ' },
      { name: 'からふる ますきんぐてーぷ', price: 110, query: 'マスキングテープ カラフル' },
      { name: 'もくめちょう てーぷ', price: 110, query: '木目調 マスキングテープ' }
    ]
  },
  {
    id: 'mall',
    name: 'もーる・りぼん',
    icon: '🧶',
    searchKeyword: 'モール リボン',
    sampleItems: [
      { name: 'ふわふわ もーる', price: 110, query: 'カラーモール' },
      { name: 'きらきら もーる', price: 110, query: 'キラキラ モール' },
      { name: 'かわいい りぼん', price: 110, query: 'サテンリボン ギフトリボン' },
      { name: 'れーす りぼん', price: 110, query: 'レース リボン' }
    ]
  },
  {
    id: 'flower',
    name: 'おはながみ・がようし',
    icon: '🌸',
    searchKeyword: 'お花紙 画用紙 折り紙',
    sampleItems: [
      { name: 'からふる おはながみ', price: 110, query: 'お花紙 ペーパーフラワー' },
      { name: 'いろがようし', price: 110, query: '色画用紙' },
      { name: 'きらきら おりかみ', price: 110, query: 'ホイル折り紙 キラキラ' },
      { name: 'ふぇるとしーと', price: 110, query: 'カラーフェルト' }
    ]
  },
  {
    id: 'light',
    name: 'きらきらかざり・らいと',
    icon: '💡',
    searchKeyword: 'LEDライト イルミネーション ガーランド',
    sampleItems: [
      { name: 'LED じゅえるらいと', price: 110, query: 'ジュエリーライト LED' },
      { name: 'ぼーる らいと', price: 220, query: 'ボールライト イルミネーション' },
      { name: 'ふらっぐ がーらんど', price: 110, query: 'フラッグ ガーランド' },
      { name: 'きらきら もーびる', price: 110, query: 'キラキラ オーナメント' }
    ]
  },
  {
    id: 'custom',
    name: 'じぶんで もじをいれる',
    icon: '✏️',
    searchKeyword: '',
    sampleItems: []
  }
];

// 対象店舗定義（ダイソー / セリア）
const STORE_LIST = [
  {
    id: 'daiso',
    name: 'ダイソー',
    enName: 'DAISO',
    icon: '🔴',
    color: '#e6007e', // ダイソーピンク
    subColor: '#c2006a',
    bg: '#fff0f6',
    border: '#fcc2d7',
    searchPrefix: 'ダイソー'
  },
  {
    id: 'seria',
    name: 'セリア',
    enName: 'Seria',
    icon: '🟢',
    color: '#008b4b', // セリアグリーン
    subColor: '#006636',
    bg: '#ebfbee',
    border: '#b2f2bb',
    searchPrefix: 'セリア'
  }
];

// 初期設定（先生用設定のデフォルト）
const DEFAULT_SETTINGS = {
  maxCount: 4,      // ぜんぶで4個まで（ワークシート2枚分相当）
  maxPrice: 500,    // ぜんぶで500円まで
  priceUnit: 110    // 税込110円基準
};
