/* Traductions de l'interface (le texte français sert de clé). Les cours et quiz restent en français. */
window.M = window.M || {};

M.I18N = {
  // Libellés ajoutés avec Mèche IA (l'anglais de base est dans settings.js)
  en: {
    "Actus": "News", "Compte & sécurité": "Account & security", "Aide & tutoriel": "Help & tour", "Relancer le tutoriel": "Restart the tour", "Gérer mon compte": "Manage my account", "Mon compte": "My account", "Communiqués officiels": "Official releases", "Mouvements": "Market moves",
    "IA": "AI", "Mèche IA": "Mèche AI", "Copilote": "Copilot", "Chat": "Chat", "Envoyer": "Send",
    "Entraîner maintenant": "Train now", "Appliquer la proposition": "Apply the proposal", "Garder mon ordre": "Keep my order", "Annuler": "Cancel",
    "Ton ordre": "Your order", "Proposition IA": "AI proposal", "Alerte du copilote": "Copilot alert", "État du modèle": "Model status",
    "Exemples appris": "Learned examples", "Précision sur données non vues": "Accuracy on unseen data", "Dernier entraînement": "Last training",
    "Ce qu'il surveille": "What it watches", "Cerveau Claude (optionnel)": "Claude brain (optional)", "Effacer la conversation": "Clear conversation"
  },
  zh: {
    "Actus": "资讯", "Compte & sécurité": "账户与安全", "Aide & tutoriel": "帮助与教程", "Relancer le tutoriel": "重新开始教程", "Gérer mon compte": "管理我的账户", "Mon compte": "我的账户", "Communiqués officiels": "官方公告", "Mouvements": "市场动态",
    "Accueil": "首页", "Live": "实盘行情", "Missions": "任务", "Swipe": "滑动", "Algo Lab": "算法实验室", "Académie": "学院", "Quiz": "测验", "Profil": "个人资料", "Paramètres": "设置",
    "Apprends à trader.": "学会交易。", "Sans te brûler.": "不再亏到怀疑人生。", "Trader en live": "实时交易", "Rejouer un krach": "重温一次暴跌",
    "Portefeuille": "资产", "Trades": "交易", "Cours": "课程", "Badges": "徽章", "Marchés": "市场", "en direct": "实时",
    "Trading temps réel": "实时交易", "Ouvrir le terminal": "打开交易终端", "Rejoue l'histoire": "重温历史", "Choisir une mission": "选择任务",
    "Swipe : haut ou bas ?": "滑动：涨还是跌？", "Jouer": "开始玩", "4 algos à backtester": "4 个可回测的算法", "Lancer un test": "开始测试",
    "Relever le défi": "接受挑战", "Quiz express": "快速测验", "Commencer": "开始",
    "Valeur du compte": "账户价值", "Cash dispo": "可用资金", "Mise": "投入金额", "Levier": "杠杆", "Stop-loss": "止损", "Objectif": "止盈",
    "Exposition": "敞口", "Risque si stop": "止损风险", "Liquidation": "强平", "Ratio R:R": "盈亏比", "Historique": "历史", "Analyse coach": "教练分析",
    "Clôturer": "平仓", "Stop au point mort": "止损移至保本", "Entrée": "开仓价", "Prix": "价格", "Marge": "保证金", "Aucune position ouverte.": "暂无持仓。",
    "Flux des trades réels": "实时成交流", "Long": "做多", "Short": "做空", "Position déjà ouverte": "已有持仓",
    "Bougie suivante ▶": "下一根K线 ▶", "Aller à la fin": "跳到结尾", "Compte mission": "任务账户", "Pas encore jouée": "尚未完成", "Rejouer": "重玩", "Autres missions": "其他任务",
    "Baisse": "跌", "Hausse": "涨", "Manche": "回合",
    "Lancer le backtest": "开始回测", "Comparer les 4 algos": "比较 4 个算法", "Actif": "资产", "Unité de temps": "时间周期", "Frais / ordre": "每笔手续费",
    "Rendement algo": "算法收益", "Acheter & garder": "买入持有", "Perte max": "最大回撤", "Réussite": "胜率", "Courbe de capital": "资金曲线", "Derniers trades de l'algo": "算法最近交易",
    "Modules": "模块", "Glossaire": "术语表", "Chapitre suivant →": "下一章 →", "← Précédent": "← 上一章", "Passer au quiz 🎯": "去做测验 🎯", "Quiz final": "最终测验",
    "Question suivante →": "下一题 →", "Voir mon score": "查看得分", "À retenir": "要点", "Refaire le quiz": "重新测验",
    "Taux de réussite": "胜率", "Meilleur trade": "最佳交易", "PnL réalisé": "已实现盈亏",
    "Vérifier": "检查", "Continuer": "继续", "Vrai": "对", "Faux": "错", "Bien joué !": "做得好！", "Pas tout à fait…": "不完全对…",
    "Apparence": "外观", "Profil & icône": "资料与图标", "Langue & devise": "语言与货币", "Trading": "交易", "Sons & confort": "声音与舒适", "Données": "数据",
    "Thème": "主题", "Couleur d'accent": "强调色", "Police du texte": "正文字体", "Police des titres": "标题字体", "Taille du texte": "文字大小",
    "Intensité du flou": "模糊强度", "Arrondis": "圆角", "Animations": "动画", "Fond d'écran": "壁纸", "Pseudo": "昵称", "Photo de profil": "头像",
    "Icône de l'app": "应用图标", "Nom de l'app": "应用名称", "Langue": "语言", "Devise d'affichage": "显示货币", "Capital de départ": "初始资金",
    "Ajouter des fonds virtuels": "增加虚拟资金", "Levier maximum": "最大杠杆", "Stop-loss par défaut": "默认止损", "Objectif par défaut": "默认止盈",
    "Confirmer chaque ordre": "每笔订单需确认", "Limite de perte du jour": "每日亏损上限", "Sons": "声音", "Vibrations": "振动", "Infobulles explicatives": "说明提示",
    "Mode discret": "隐私模式", "Exporter ma progression": "导出进度", "Importer une sauvegarde": "导入备份", "Réinitialiser le portefeuille": "重置资产", "Tout effacer": "全部清除",
    "Choisir une image": "选择图片", "Retirer": "移除", "Réinitialiser l'apparence": "重置外观", "Tes badges": "你的徽章",
    "IA": "AI", "Mèche IA": "Mèche AI 助手", "Copilote": "副驾驶", "Chat": "聊天", "Envoyer": "发送",
    "Entraîner maintenant": "立即训练", "Appliquer la proposition": "采用建议", "Garder mon ordre": "保留我的订单", "Annuler": "取消",
    "Ton ordre": "你的订单", "Proposition IA": "AI 建议", "Alerte du copilote": "副驾驶提醒", "État du modèle": "模型状态",
    "Exemples appris": "已学习样本", "Précision sur données non vues": "未见数据上的准确率", "Dernier entraînement": "上次训练",
    "Ce qu'il surveille": "监控内容", "Cerveau Claude (optionnel)": "Claude 大脑（可选）", "Effacer la conversation": "清空对话"
  },
  ru: {
    "Actus": "Новости", "Compte & sécurité": "Аккаунт и безопасность", "Aide & tutoriel": "Помощь и обучение", "Relancer le tutoriel": "Пройти обучение заново", "Gérer mon compte": "Управление аккаунтом", "Mon compte": "Мой аккаунт", "Communiqués officiels": "Официальные сообщения", "Mouvements": "Движения рынка",
    "Accueil": "Главная", "Live": "Онлайн", "Missions": "Миссии", "Swipe": "Свайп", "Algo Lab": "Алго-лаб", "Académie": "Академия", "Quiz": "Квиз", "Profil": "Профиль", "Paramètres": "Настройки",
    "Apprends à trader.": "Научись торговать.", "Sans te brûler.": "И не сгори.", "Trader en live": "Торговать онлайн", "Rejouer un krach": "Пережить обвал заново",
    "Portefeuille": "Портфель", "Trades": "Сделки", "Cours": "Курсы", "Badges": "Значки", "Marchés": "Рынки", "en direct": "в реальном времени",
    "Trading temps réel": "Торговля в реальном времени", "Ouvrir le terminal": "Открыть терминал", "Rejoue l'histoire": "Переиграй историю", "Choisir une mission": "Выбрать миссию",
    "Swipe : haut ou bas ?": "Свайп: вверх или вниз?", "Jouer": "Играть", "4 algos à backtester": "4 алгоритма для бэктеста", "Lancer un test": "Запустить тест",
    "Relever le défi": "Принять вызов", "Quiz express": "Быстрый квиз", "Commencer": "Начать",
    "Valeur du compte": "Стоимость счёта", "Cash dispo": "Свободные средства", "Mise": "Сумма", "Levier": "Плечо", "Stop-loss": "Стоп-лосс", "Objectif": "Тейк-профит",
    "Exposition": "Объём позиции", "Risque si stop": "Риск до стопа", "Liquidation": "Ликвидация", "Ratio R:R": "Риск/прибыль", "Historique": "История", "Analyse coach": "Разбор тренера",
    "Clôturer": "Закрыть", "Stop au point mort": "Стоп в безубыток", "Entrée": "Вход", "Prix": "Цена", "Marge": "Маржа", "Aucune position ouverte.": "Нет открытых позиций.",
    "Flux des trades réels": "Лента реальных сделок", "Long": "Лонг", "Short": "Шорт", "Position déjà ouverte": "Позиция уже открыта",
    "Bougie suivante ▶": "Следующая свеча ▶", "Aller à la fin": "В конец", "Compte mission": "Счёт миссии", "Pas encore jouée": "Ещё не пройдена", "Rejouer": "Переиграть", "Autres missions": "Другие миссии",
    "Baisse": "Вниз", "Hausse": "Вверх", "Manche": "Раунд",
    "Lancer le backtest": "Запустить бэктест", "Comparer les 4 algos": "Сравнить 4 алгоритма", "Actif": "Актив", "Unité de temps": "Таймфрейм", "Frais / ordre": "Комиссия / ордер",
    "Rendement algo": "Доходность алгоритма", "Acheter & garder": "Купить и держать", "Perte max": "Макс. просадка", "Réussite": "Доля прибыльных", "Courbe de capital": "Кривая капитала", "Derniers trades de l'algo": "Последние сделки алгоритма",
    "Modules": "Модули", "Glossaire": "Глоссарий", "Chapitre suivant →": "Следующая глава →", "← Précédent": "← Назад", "Passer au quiz 🎯": "К квизу 🎯", "Quiz final": "Итоговый квиз",
    "Question suivante →": "Следующий вопрос →", "Voir mon score": "Мой результат", "À retenir": "Главное", "Refaire le quiz": "Пройти снова",
    "Taux de réussite": "Доля прибыльных", "Meilleur trade": "Лучшая сделка", "PnL réalisé": "Реализованный PnL",
    "Vérifier": "Проверить", "Continuer": "Дальше", "Vrai": "Верно", "Faux": "Неверно", "Bien joué !": "Отлично!", "Pas tout à fait…": "Не совсем…",
    "Apparence": "Оформление", "Profil & icône": "Профиль и иконка", "Langue & devise": "Язык и валюта", "Trading": "Торговля", "Sons & confort": "Звук и удобство", "Données": "Данные",
    "Thème": "Тема", "Couleur d'accent": "Акцентный цвет", "Police du texte": "Шрифт текста", "Police des titres": "Шрифт заголовков", "Taille du texte": "Размер текста",
    "Intensité du flou": "Сила размытия", "Arrondis": "Скругления", "Animations": "Анимации", "Fond d'écran": "Обои", "Pseudo": "Ник", "Photo de profil": "Фото профиля",
    "Icône de l'app": "Иконка приложения", "Nom de l'app": "Название приложения", "Langue": "Язык", "Devise d'affichage": "Валюта отображения", "Capital de départ": "Стартовый капитал",
    "Ajouter des fonds virtuels": "Добавить виртуальные средства", "Levier maximum": "Максимальное плечо", "Stop-loss par défaut": "Стоп-лосс по умолчанию", "Objectif par défaut": "Тейк-профит по умолчанию",
    "Confirmer chaque ordre": "Подтверждать каждый ордер", "Limite de perte du jour": "Дневной лимит убытка", "Sons": "Звуки", "Vibrations": "Вибрация", "Infobulles explicatives": "Подсказки",
    "Mode discret": "Скрытый режим", "Exporter ma progression": "Экспорт прогресса", "Importer une sauvegarde": "Импорт резервной копии", "Réinitialiser le portefeuille": "Сбросить портфель", "Tout effacer": "Стереть всё",
    "Choisir une image": "Выбрать изображение", "Retirer": "Убрать", "Réinitialiser l'apparence": "Сбросить оформление", "Tes badges": "Твои значки",
    "IA": "ИИ", "Mèche IA": "Mèche ИИ", "Copilote": "Второй пилот", "Chat": "Чат", "Envoyer": "Отправить",
    "Entraîner maintenant": "Обучить сейчас", "Appliquer la proposition": "Применить предложение", "Garder mon ordre": "Оставить мой ордер", "Annuler": "Отмена",
    "Ton ordre": "Твой ордер", "Proposition IA": "Предложение ИИ", "Alerte du copilote": "Сигнал второго пилота", "État du modèle": "Состояние модели",
    "Exemples appris": "Изучено примеров", "Précision sur données non vues": "Точность на новых данных", "Dernier entraînement": "Последнее обучение",
    "Ce qu'il surveille": "Что он отслеживает", "Cerveau Claude (optionnel)": "Мозг Claude (необязательно)", "Effacer la conversation": "Очистить чат"
  }
};

// Libellés ajoutés avec la finalisation (Académie, Time Machine, Vega Desk, terminal multi-marchés, hors ligne)
(function () {
  const K = ["Apprends les vraies règles du jeu", "Chaque terme souligné en pointillés s'explique au survol (ou d'un tap sur mobile). Chaque module se termine par un quiz.",
    "Le dico du trader", "Rejoue les moments qui ont secoué les marchés", "Tous les actifs", "Toutes", "Toutes difficultés", "Pas encore jouées", "Déjà jouées", "Au hasard",
    "Facile", "Moyen", "Difficile", "Extrême", "Vega Desk", "Dans la peau d'un trader d'options", "Plein écran", "Les cours du desk", "Guide des onglets",
    "Crypto", "Bourses", "Matières", "Devises", "● DIFFÉRÉ", "● COPIE", "● FERMÉ", "indisponible", "Installer l'app", "Recharger", "Krachs historiques",
    "Mentions légales · Confidentialité · Risques", "Supprimer mon compte", "Supprimer le compte", "Aucune mission ne correspond. Élargis les filtres."];
  const T = {
    en: ["Learn the real rules of the game", "Every term underlined with dots is explained on hover (or with a tap on mobile). Each module ends with a quiz.",
      "The trader's dictionary", "Replay the moments that shook the markets", "All assets", "All", "All difficulties", "Not played yet", "Already played", "Random",
      "Easy", "Medium", "Hard", "Extreme", "Vega Desk", "In an options trader's shoes", "Full screen", "The desk courses", "Tab guide",
      "Crypto", "Stocks", "Commodities", "Currencies", "● DELAYED", "● COPY", "● CLOSED", "unavailable", "Install the app", "Reload", "Historic crashes",
      "Legal notice · Privacy · Risks", "Delete my account", "Delete account", "No mission matches. Widen the filters."],
    zh: ["学习真正的游戏规则", "每个带点状下划线的术语，悬停（手机上轻点）即可看到解释。每个模块都以一个测验结束。",
      "交易者词典", "重温震撼市场的时刻", "全部资产", "全部", "全部难度", "尚未完成", "已完成", "随机",
      "简单", "中等", "难", "极难", "Vega 交易台", "体验期权交易员的工作", "全屏", "交易台课程", "标签指南",
      "加密货币", "股市", "大宗商品", "外汇", "● 延迟", "● 副本", "● 休市", "不可用", "安装应用", "重新加载", "历史暴跌",
      "法律声明 · 隐私 · 风险", "删除我的账户", "删除账户", "没有符合条件的任务。请放宽筛选条件。"],
    ru: ["Узнай настоящие правила игры", "Каждый термин, подчёркнутый пунктиром, объясняется при наведении (или касанием на телефоне). Каждый модуль заканчивается квизом.",
      "Словарь трейдера", "Переживи заново моменты, которые потрясли рынки", "Все активы", "Все", "Любая сложность", "Ещё не пройдены", "Уже пройдены", "Наугад",
      "Легко", "Средне", "Сложно", "Экстрим", "Vega Desk", "На месте опционного трейдера", "На весь экран", "Курсы деска", "Гид по вкладкам",
      "Крипта", "Биржи", "Сырьё", "Валюты", "● С ЗАДЕРЖКОЙ", "● КОПИЯ", "● ЗАКРЫТ", "недоступно", "Установить приложение", "Перезагрузить", "Исторические крахи",
      "Правовая информация · Конфиденциальность · Риски", "Удалить мой аккаунт", "Удалить аккаунт", "Ни одна миссия не подходит. Ослабь фильтры."]
  };
  Object.keys(T).forEach(l => { M.I18N[l] = M.I18N[l] || {}; K.forEach((k, i) => { if (T[l][i]) M.I18N[l][k] = T[l][i]; }); });
})();

// Libellés des comptes, abonnements et du trading réel
(function () {
  const K = ["Trading réel", "Abonnement", "Avant de commencer", "Mon compte Binance", "Courtiers agréés", "Journal", "Code e-mail", "Mot de passe", "Téléphone",
    "J'ai un compte", "Créer un compte", "Se connecter", "Créer mon compte", "Mot de passe oublié ?", "Crée ton compte ou connecte-toi", "Recevoir un code", "Recevoir un SMS",
    "Acheter", "Vendre", "Au marché", "À cours limité", "Vérifier l'ordre", "Solde", "Ordre", "Ordres ouverts", "Mes plafonds", "Verrouiller", "Déverrouiller",
    "Coffre verrouillé", "Paiement sécurisé", "Mobile money", "Carte bancaire", "Russie", "Prix à fixer", "bientôt disponible", "pour toujours", "Le plus choisi",
    "Confirmer l'ordre", "Envoyer l'ordre", "Annuler", "Enregistrer", "Se déconnecter", "Synchroniser maintenant", "Voir les offres", "Gérer", "Changer", "Ajouter",
    "Double authentification (2FA)", "Se déconnecter partout", "Continuer vers le paiement", "Offre actuelle de base", "J'accepte et je continue", "Exporter (CSV)",
    "Journal des ordres réels", "Vérifie toujours l'agrément", "Chiffrer et vérifier", "Testnet (argent fictif)", "Compte réel", "Aucun ordre ouvert."];
  const T = {
    en: ["Real trading", "Subscription", "Before you start", "My Binance account", "Licensed brokers", "Journal", "E-mail code", "Password", "Phone",
      "I have an account", "Create an account", "Sign in", "Create my account", "Forgot password?", "Create your account or sign in", "Get a code", "Get an SMS",
      "Buy", "Sell", "Market", "Limit", "Check the order", "Balance", "Order", "Open orders", "My limits", "Lock", "Unlock",
      "Vault locked", "Secure payment", "Mobile money", "Bank card", "Russia", "Price to be set", "coming soon", "forever", "Most popular",
      "Confirm the order", "Send the order", "Cancel", "Save", "Sign out", "Sync now", "See the plans", "Manage", "Change", "Add",
      "Two-factor authentication (2FA)", "Sign out everywhere", "Continue to payment", "Current basic plan", "I accept and continue", "Export (CSV)",
      "Real orders journal", "Always check the licence", "Encrypt and verify", "Testnet (play money)", "Real account", "No open orders."],
    zh: ["真实交易", "订阅", "开始之前", "我的币安账户", "持牌经纪商", "日志", "邮箱验证码", "密码", "电话",
      "我有账户", "创建账户", "登录", "创建我的账户", "忘记密码？", "创建账户或登录", "获取验证码", "获取短信",
      "买入", "卖出", "市价", "限价", "检查订单", "余额", "订单", "未成交订单", "我的限额", "锁定", "解锁",
      "保险库已锁定", "安全支付", "移动支付", "银行卡", "俄罗斯", "价格待定", "即将推出", "永久", "最受欢迎",
      "确认订单", "发送订单", "取消", "保存", "退出登录", "立即同步", "查看方案", "管理", "更改", "添加",
      "双重验证（2FA）", "在所有设备上退出", "继续付款", "当前基础方案", "我接受并继续", "导出（CSV）",
      "真实订单日志", "务必核实牌照", "加密并验证", "测试网（模拟资金）", "真实账户", "没有未成交订单。"],
    ru: ["Реальная торговля", "Подписка", "Перед началом", "Мой аккаунт Binance", "Лицензированные брокеры", "Журнал", "Код по e-mail", "Пароль", "Телефон",
      "У меня есть аккаунт", "Создать аккаунт", "Войти", "Создать мой аккаунт", "Забыли пароль?", "Создай аккаунт или войди", "Получить код", "Получить SMS",
      "Купить", "Продать", "По рынку", "Лимитный", "Проверить ордер", "Баланс", "Ордер", "Открытые ордера", "Мои лимиты", "Заблокировать", "Разблокировать",
      "Сейф заблокирован", "Безопасная оплата", "Мобильные деньги", "Банковская карта", "Россия", "Цена уточняется", "скоро", "навсегда", "Самый популярный",
      "Подтвердить ордер", "Отправить ордер", "Отмена", "Сохранить", "Выйти", "Синхронизировать", "Смотреть тарифы", "Управлять", "Изменить", "Добавить",
      "Двухфакторная аутентификация (2FA)", "Выйти на всех устройствах", "Перейти к оплате", "Текущий базовый тариф", "Принимаю и продолжаю", "Экспорт (CSV)",
      "Журнал реальных ордеров", "Всегда проверяй лицензию", "Зашифровать и проверить", "Testnet (виртуальные деньги)", "Реальный счёт", "Открытых ордеров нет."]
  };
  Object.keys(T).forEach(l => { M.I18N[l] = M.I18N[l] || {}; K.forEach((k, i) => { if (T[l][i]) M.I18N[l][k] = T[l][i]; }); });
})();
