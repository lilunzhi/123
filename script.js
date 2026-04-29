// 全局变量
let currentRoute = null;
let completedRoutes = [];
let currentStation = null;
let currentBuilding = null;
let landRouteCompletedBuildings = [];
let seaRouteCompletedBuildings = [];

// 建筑数据
const buildingData = {
    land: {
        1: {
            1: {
                title: '黄土窑洞',
                image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=loess%20cave%20dwelling%20hand-drawn%20style%20no%20red%20dots&image_size=square',
                description: 'Loess Cave Dwelling - 黄土高原传统民居，依山开凿而成',
                color: '#CD853F',
                structures: [
                    { name: '窑洞入口', description: '窑洞的进出通道', x: 30, y: 50 },
                    { name: '窑洞内部', description: '居住空间，冬暖夏凉', x: 60, y: 50 }
                ],
                background: '黄土高原沟壑'
            },
            2: {
                title: '喀什古城民居',
                image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kashgar%20ancient%20city%20residence%20hand-drawn%20style%20no%20red%20dots&image_size=square',
                description: 'Kashgar Ancient City Residence - 西域传统民居，具有浓郁的民族特色',
                color: '#D2B48C',
                structures: [
                    { name: '庭院', description: '民居的中心空间', x: 50, y: 40 },
                    { name: '晾房', description: '用于晾晒葡萄等农产品', x: 70, y: 30 }
                ],
                background: '西域戈壁街巷'
            }
        }
    },
    sea: {
        1: {
            1: {
                title: '福建土楼',
                image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fujian%20tulou%20hand-drawn%20style%20no%20red%20dots&image_size=square',
                description: 'Fujian Tulou - 福建传统民居，以圆形土楼为特色',
                color: '#F5DEB3',
                structures: [
                    { name: '土楼外墙', description: '厚实的夯土墙，防御功能强', x: 30, y: 50 },
                    { name: '中心祠堂', description: '土楼的核心，用于家族活动', x: 50, y: 50 }
                ],
                background: '闽西南青山梯田'
            },
            2: {
                title: '广府民居',
                image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cantonese%20traditional%20residence%20hand-drawn%20style%20no%20red%20dots&image_size=square',
                description: 'Cantonese Traditional Residence - 岭南传统民居，镬耳山墙是其特色',
                color: '#8B8B8B',
                structures: [
                    { name: '镬耳山墙', description: '形似镬耳的山墙，防火防风', x: 20, y: 40 },
                    { name: '天井', description: '建筑中间的露天空间，通风采光', x: 50, y: 50 }
                ],
                background: '岭南水乡'
            }
        }
    }
};

// 路线进度管理
function markRouteCompleted(route) {
    let progress = JSON.parse(localStorage.getItem('silkRoadProgress') || '{"land": false, "sea": false}');
    progress[route] = true;
    localStorage.setItem('silkRoadProgress', JSON.stringify(progress));
}

function showAchievement(buildingName, count) {
    // 获取建筑颜色
    const buildingColors = {
        '黄土窑洞': '#CD853F',
        '喀什古城民居': '#D2B48C',
        '福建土楼': '#F5DEB3',
        '广府民居': '#8B8B8B'
    };
    const color = buildingColors[buildingName] || '#8B8B8B';
    
    // 移除已存在的展示容器（防止重复）
    const existingContainer = document.querySelector('.earth-manuscript-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // 创建新的展示容器 - 第一步：只显示土的信息
    const container = document.createElement('div');
    container.className = 'earth-manuscript-container active';
    container.innerHTML = `
        <div class="earth-manuscript-content step1">
            <div class="earth-section">
                <div class="earth-icon"></div>
                <h2>获得一捧土</h2>
                <p>您探索了<strong>${buildingName}</strong></p>
                
                <div class="earth-color" style="background-color: ${color}"></div>
            </div>
            
            <button class="show-manuscript-btn" onclick="showManuscriptStep()">查看手稿</button>
        </div>
    `;
    document.body.appendChild(container);
    
    // 存储建筑信息供下一步使用
    window.currentBuildingName = buildingName;
    window.currentColor = color;
}

// 显示手稿（第二步）
function showManuscriptStep() {
    const content = document.querySelector('.earth-manuscript-content');
    if (!content) return;
    
    // 移除第一步样式，添加第二步样式
    content.classList.remove('step1');
    content.classList.add('step2');
    
    // 让土的部分缩小到角落，保留颜色圆圈和名称
    const earthSection = content.querySelector('.earth-section');
    if (earthSection) {
        earthSection.classList.add('mini');
        // 保留土的颜色圆圈和建筑名称
        earthSection.innerHTML = `
            <div class="earth-color-mini" style="background-color: ${window.currentColor || '#8B8B8B'}"></div>
            <span class="earth-name-mini">${window.currentBuildingName}</span>
        `;
    }
    
    // 根据建筑名称设置对应的手稿图片路径
    let manuscriptImagePath = '';
    switch(window.currentBuildingName) {
        case '黄土窑洞':
            manuscriptImagePath = '素材1/窑洞手稿.png';
            break;
        case '福建土楼':
            manuscriptImagePath = '素材1/土楼手稿.png';
            break;
        case '喀什古城民居':
            manuscriptImagePath = '素材1/喀什手稿.png';
            break;
        case '广府民居':
            manuscriptImagePath = '素材1/广府手稿.png';
            break;
        default:
            manuscriptImagePath = '手稿.jpg';
    }
    
    // 添加手稿区域（占满整个空间）
    const manuscriptSection = document.createElement('div');
    manuscriptSection.className = 'manuscript-section-full';
    manuscriptSection.innerHTML = `
        <div class="manuscript-image-full" style="background-image: url('${manuscriptImagePath}');"></div>
    `;
    content.appendChild(manuscriptSection);
    
    // 将按钮改为继续探索
    const btn = content.querySelector('.show-manuscript-btn');
    if (btn) {
        btn.textContent = '继续探索';
        btn.className = 'continue-button';
        btn.onclick = function() {
            handleEarthManuscriptClose();
        };
    }
}

// 处理关闭展示后的逻辑
function handleEarthManuscriptClose() {
    const container = document.querySelector('.earth-manuscript-container');
    if (container) {
        container.remove();
    }
    
    // 如果有后续操作，执行它
    if (window.earthManuscriptNextAction) {
        const action = window.earthManuscriptNextAction;
        window.earthManuscriptNextAction = null;
        action();
    } else if (window.earthManuscriptNextPage) {
        setTimeout(() => {
            window.location.href = window.earthManuscriptNextPage;
            window.earthManuscriptNextPage = null;
        }, 300);
    }
}

// 设置展示关闭后的跳转页面
function setEarthManuscriptNextPage(page) {
    window.earthManuscriptNextPage = page;
}

// 设置展示关闭后的操作
function setEarthManuscriptNextAction(action) {
    window.earthManuscriptNextAction = action;
}

// 显示完成探索卡片
function showCompletionCards() {
    // 收集的土数据
    const soilCollection = [
        { name: '黄土窑洞', color: '#CD853F' },
        { name: '喀什古城民居', color: '#D2B48C' },
        { name: '福建土楼', color: '#F5DEB3' },
        { name: '广府民居', color: '#8B8B8B' }
    ];
    
    // 手稿内容
    const manuscriptContent = "丝路之上，民居如星。从黄土高原到岭南水乡，从陆路到海路，每一座建筑都是历史的见证。土，是建筑的根基，也是文化的载体。当你触摸这些古老的墙壁，仿佛能感受到丝路商队的驼铃声，听到历史的呼吸。每一片瓦、每一块砖，都诉说着丝路的故事，传递着文明的火种。";
    
    // 创建卡片容器
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'completion-cards';
    cardsContainer.innerHTML = `
        <div class="completion-cards-container">
            <!-- 收集的土卡片 -->
            <div class="completion-card">
                <h3>收集的土</h3>
                <div class="soil-collection">
                    ${soilCollection.map(soil => `
                        <div class="soil-item">
                            <div class="soil-color" style="background-color: ${soil.color}"></div>
                            <div class="soil-name">${soil.name}</div>
                        </div>
                    `).join('')}
                </div>
                <button class="close-cards-button" onclick="closeCompletionCards()">关闭</button>
            </div>
            
            <!-- 手稿卡片 -->
            <div class="completion-card">
                <h3>行客手稿</h3>
                <div class="manuscript-content">
                    ${manuscriptContent}
                </div>
                <button class="close-cards-button" onclick="closeCompletionCards()">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(cardsContainer);
}

// 关闭完成探索卡片
function closeCompletionCards() {
    const cards = document.querySelector('.completion-cards');
    if (cards) {
        cards.remove();
    }
}

function getRouteProgress() {
    return JSON.parse(localStorage.getItem('silkRoadProgress') || '{"land": false, "sea": false}');
}

function resetProgress() {
    localStorage.setItem('silkRoadProgress', JSON.stringify({"land": false, "sea": false}));
}

// 全局变量
let typeWriterTimeout = null;
let isSkipped = false;

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    // 如果是在首页，可以考虑重置进度（根据需求决定是否需要）
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        // resetProgress(); // 如果每次回首页都重置，则开启此行
    }
    
    // 封面页面点击事件
    const coverPage = document.getElementById('cover-page');
    const introScene = document.getElementById('opening-intro');
    
    coverPage.addEventListener('click', function() {
        // 播放点击音效
        playSound('manuscript');
        
        // 隐藏封面页面，显示介绍场景
        coverPage.classList.add('hidden');
        introScene.classList.remove('hidden');
        
        // 触发介绍内容的显示
        setTimeout(() => {
            document.querySelector('.background-content').style.opacity = '1';
            document.querySelector('.main-title').style.opacity = '1';
            document.querySelector('.sub-title').style.opacity = '1';
            // 延迟1秒后开始打字效果
            typeWriterTimeout = setTimeout(() => {
                if (!isSkipped) {
                    typeWriter();
                }
            }, 1000);
        }, 100);
    });
    
    const traveler = document.querySelector('.traveler');
    
    // 点击旅人后播放音效
    traveler.addEventListener('click', function() {
        // 播放点击音效
        playSound('manuscript');
    });
    
    // 跳过按钮点击事件
    const skipButton = document.getElementById('skip-intro');
    if (skipButton) {
        skipButton.addEventListener('click', function() {
            // 播放点击音效
            playSound('manuscript');
            
            // 设置跳过标志
            isSkipped = true;
            
            // 取消打字效果的执行
            if (typeWriterTimeout) {
                clearTimeout(typeWriterTimeout);
                typeWriterTimeout = null;
            }
            
            // 直接显示所有内容，跳过文字动画
            document.querySelector('.background-content').style.opacity = '1';
            document.querySelector('.main-title').style.opacity = '1';
            document.querySelector('.sub-title').style.opacity = '1';
            
            // 立即显示所有段落内容
            const paragraphs = document.querySelectorAll('.intro-paragraphs p');
            paragraphs.forEach(para => {
                para.style.opacity = '1';
                // 直接显示完整文本，跳过打字效果
                if (para.id === 'paragraph1') {
                    para.textContent = '他是来自遥远西域的异域旅人，人们只叫他「行客」。';
                } else if (para.id === 'paragraph2') {
                    para.textContent = '曾是丝绸之路上的商队向导，踏遍了陆路的戈壁与绿洲，也航过海路的风浪与远港。半生漂泊间，他记录下了沿途每一座城邦的建筑与风土。';
                } else if (para.id === 'paragraph3') {
                    para.textContent = '如今，他将自己的所见所闻化作了这段旅程的引路人 —— 随着身影渐渐透明，他把丝路的故事、建筑的密码、旅途的记忆，完整地铺展在你的面前，邀请你重走这条连接东西方的文明之路，选择属于你的商队路线，去亲自触摸那些被时光封存的奇迹。';
                }
            });
            
            // 立即显示选择按钮
            document.querySelector('.choice-buttons').style.opacity = '1';
        });
    }
    
    // 播放背景音乐
    setTimeout(() => {
        playSound('background');
    }, 1000);
});

// 分段打字效果函数
function typeWriter() {
    // 如果已经跳过，直接返回
    if (isSkipped) {
        return;
    }
    
    const paragraphs = [
        { id: 'paragraph1', text: document.getElementById('paragraph1').textContent },
        { id: 'paragraph2', text: document.getElementById('paragraph2').textContent },
        { id: 'paragraph3', text: document.getElementById('paragraph3').textContent }
    ];
    
    let currentParagraph = 0;
    let currentChar = 0;
    const typingSpeed = 30; // 打字速度（毫秒/字符）
    const paragraphDelay = 1000; // 段落间延迟（毫秒）

    // 初始化所有段落为空
    paragraphs.forEach(para => {
        document.getElementById(para.id).textContent = '';
        document.getElementById(para.id).style.opacity = '1';
    });

    function type() {
        // 每次执行前检查是否已跳过
        if (isSkipped) {
            return;
        }
        
        if (currentParagraph < paragraphs.length) {
            const para = paragraphs[currentParagraph];
            if (currentChar < para.text.length) {
                document.getElementById(para.id).textContent += para.text.charAt(currentChar);
                currentChar++;
                setTimeout(type, typingSpeed);
            } else {
                // 当前段落打字完成，切换到下一段
                currentParagraph++;
                currentChar = 0;
                setTimeout(type, paragraphDelay);
            }
        } else {
            // 所有段落打字完成后显示选择按钮
            setTimeout(() => {
                if (!isSkipped) {
                    document.querySelector('.choice-buttons').style.opacity = '1';
                    // 播放开头语音提示
                    playVoicePrompt('语音提示/开头/丝路旅途正式开启！面前分为陆路与海路两条探索路线，请你点击选择想要出发的方向，开启民居探秘之旅.MP3');
                }
            }, 500);
        }
    }

    type();
}

// 语音提示播放函数
function playVoicePrompt(audioPath) {
    try {
        const audio = new Audio(audioPath);
        audio.volume = 1.0;
        audio.play().catch(e => {
            console.log('语音提示播放失败:', e);
        });
    } catch (e) {
        console.log('语音提示创建失败:', e);
    }
}

// 音效播放函数
function playSound(type) {
    // 使用实际的音频文件
    let audioPath = '';
    
    switch(type) {
        case 'wind':
            // 陆上丝绸之路音效 - 驼铃或风声
            audioPath = '音效/音效/驼铃.MP3';
            break;
        case 'wave':
            // 海上丝绸之路音效 - 海浪声
            audioPath = '音效/音效/海上丝绸之路点击音效（波浪）.MP3';
            break;
        case 'cave':
            // 黄土窑洞音效
            audioPath = '音效/音效/黄土窑洞＋风声.MP3';
            break;
        case 'kashgar':
            // 喀什古城音效
            audioPath = '语音提示/语音提示2/新疆喀什古城民居-背景音.MP3';
            break;
        case 'tulou':
            // 福建土楼音效
            audioPath = '音效/音效/福建土楼+海浪+海鸟.MP3';
            break;
        case 'cantonese':
            // 广府民居音效
            audioPath = '音效/音效/广府民居+海浪+海鸟.MP3';
            break;
        case 'manuscript':
            // 手稿翻开音效
            audioPath = '音效/音效/手稿翻开.MP3';
            break;
        case 'rowing':
            // 划船声
            audioPath = '音效/音效/划船声.MP3';
            break;
        case 'background':
            // 背景音乐
            audioPath = '音效/音效/整体背景音乐.MP3';
            break;
        default:
            // 默认使用整体背景音乐
            audioPath = '音效/音效/整体背景音乐.MP3';
    }
    
    // 创建并播放音频
    try {
        const audio = new Audio(audioPath);
        audio.volume = 0.8; // 设置音量
        
        // 对于背景音乐，设置循环播放
        if (type === 'background') {
            audio.loop = true;
            audio.volume = 0.15; // 背景音乐音量调低
        }
        
        audio.play().catch(e => {
            console.log('音频播放失败:', e);
            console.log('音频路径:', audioPath);
            // 如果播放失败，尝试使用 Web Audio API 作为后备方案
            fallbackSound(type);
        });
    } catch (e) {
        console.log('音频创建失败:', e);
        fallbackSound(type);
    }
}

// 后备音效方案（当音频文件无法播放时使用）
function fallbackSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (type === 'wind' || type === 'cave' || type === 'kashgar') {
            // 模拟风沙音效
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(100 + Math.random() * 200, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                }, i * 300);
            }
        } else if (type === 'wave' || type === 'tulou' || type === 'cantonese') {
            // 模拟海浪音效
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(50 + Math.random() * 100, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 1);
                }, i * 600);
            }
        } else if (type === 'manuscript' || type === 'rowing') {
            // 模拟点击音效
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    } catch (e) {
        console.log('后备音效也失败:', e);
    }
}

// 分支选择按钮点击事件
document.getElementById('land-route').addEventListener('click', function() {
    // 播放点击音效
    playSound('manuscript');
    
    resetProgress(); // 确保开始新旅程时重置
    currentRoute = 'land';
    showBranchAnimation('camel');
});

document.getElementById('sea-route').addEventListener('click', function() {
    // 播放点击音效
    playSound('manuscript');
    
    resetProgress(); // 确保开始新旅程时重置
    currentRoute = 'sea';
    showBranchAnimation('ship');
});

// 探索新路线按钮点击事件
document.getElementById('explore-sea-route').addEventListener('click', function() {
    // 播放点击音效
    playSound('manuscript');
    
    currentRoute = 'sea';
    showBranchAnimation('ship');
});

document.getElementById('explore-land-route').addEventListener('click', function() {
    // 播放点击音效
    playSound('manuscript');
    
    currentRoute = 'land';
    showBranchAnimation('camel');
});

// 返回路线按钮点击事件
document.getElementById('back-to-route').addEventListener('click', function() {
    // 播放点击音效
    playSound('manuscript');
    
    document.getElementById('building-intro').classList.add('hidden');
    if (currentRoute === 'land') {
        document.getElementById('land-route-content').classList.remove('hidden');
    } else if (currentRoute === 'sea') {
        document.getElementById('sea-route-content').classList.remove('hidden');
    }
});

// 下一站按钮点击事件
    document.getElementById('next-building').addEventListener('click', function() {
        // 播放点击音效
        playSound('manuscript');
        
        // 记录已完成的建筑
        if (currentRoute === 'land') {
            landRouteCompletedBuildings.push(buildingData[currentRoute][currentStation][currentBuilding]);
        } else if (currentRoute === 'sea') {
            seaRouteCompletedBuildings.push(buildingData[currentRoute][currentStation][currentBuilding]);
        }

        const prevBuilding = currentBuilding;

        // 增加建筑索引
        currentBuilding = parseInt(currentBuilding) + 1;

        // 检查是否完成所有建筑
        if (currentBuilding > 2) {
            checkRouteCompletion();

            // 重置索引
            currentStation = 1;
            currentBuilding = 1;

            // 返回路线页面
            document.getElementById('building-intro').classList.add('hidden');
            if (currentRoute === 'land') {
                document.getElementById('land-route-content').classList.remove('hidden');
                setTimeout(() => {
                    showStationText('陆路路线探索完成');
                }, 500);
            } else if (currentRoute === 'sea') {
                document.getElementById('sea-route-content').classList.remove('hidden');
                setTimeout(() => {
                    showStationText('海路路线探索完成');
                }, 500);
            }
        } else if (prevBuilding == 1) {
            showTransitionAnimation(currentRoute === 'land' ? 'camel' : 'ship', () => {
                showBuildingIntro();
            });
        } else {
            showBuildingIntro();
        }
    });

// 为所有了解建筑按钮添加点击事件
const exploreButtons = document.querySelectorAll('.explore-building');
exploreButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 播放点击音效
        playSound('manuscript');
        
        const station = this.closest('.station');
        currentStation = station.dataset.station;
        currentBuilding = this.dataset.building;
        showBuildingIntro();
    });
});

// 显示转场动画（用于建筑间过渡）
function showTransitionAnimation(type, callback) {
    // 隐藏当前建筑介绍
    document.getElementById('building-intro').classList.add('hidden');
    
    // 显示分支动画场景
    const branchAnimation = document.getElementById('branch-animation');
    branchAnimation.classList.remove('hidden');
    
    // 移除所有动画类型类
    branchAnimation.classList.remove('camel', 'ship');
    // 添加当前动画类型类
    branchAnimation.classList.add(type);

    // 清空分支动画场景
    branchAnimation.innerHTML = '';

    // 创建对应动画元素
    if (type === 'camel') {
        const camelAnimation = document.createElement('div');
        camelAnimation.className = 'camel-animation';
        branchAnimation.appendChild(camelAnimation);
        // 播放风沙音效
        playSound('wind');
    } else if (type === 'ship') {
        const shipAnimation = document.createElement('div');
        shipAnimation.className = 'ship-animation';
        branchAnimation.appendChild(shipAnimation);
        // 播放海浪音效
        playSound('wave');
    }

    // 动画结束后隐藏并执行回调
    setTimeout(() => {
        branchAnimation.classList.add('hidden');
        if (callback) callback();
    }, 2000);
}

// 显示分支选择动画
function showBranchAnimation(type) {
    // 隐藏所有场景
    document.querySelectorAll('.scene').forEach(scene => {
        scene.classList.add('hidden');
    });

    // 显示分支动画场景
    const branchAnimation = document.getElementById('branch-animation');
    branchAnimation.classList.remove('hidden');
    
    // 移除所有动画类型类
    branchAnimation.classList.remove('camel', 'ship');
    // 添加当前动画类型类
    branchAnimation.classList.add(type);

    // 清空分支动画场景
    branchAnimation.innerHTML = '';

    // 创建对应动画元素
    if (type === 'camel') {
        const camelAnimation = document.createElement('div');
        camelAnimation.className = 'camel-animation';
        branchAnimation.appendChild(camelAnimation);
        // 播放风沙音效
        playSound('wind');
    } else if (type === 'ship') {
        const shipAnimation = document.createElement('div');
        shipAnimation.className = 'ship-animation';
        branchAnimation.appendChild(shipAnimation);
        // 播放海浪音效
        playSound('wave');
    }

    // 动画结束后直接跳转到对应路线的第一站页面
    setTimeout(() => {
        branchAnimation.classList.add('hidden');
        // 直接跳转到对应路线的第一站页面
        if (currentRoute === 'land') {
            window.location.href = 'land-station1.html';
        } else if (currentRoute === 'sea') {
            window.location.href = 'sea-station1.html';
        }
    }, 2000);
}

// 显示到达站点文字
function showStationText(text) {
    const textElement = document.createElement('div');
    textElement.className = 'station-text';
    textElement.textContent = text;
    document.body.appendChild(textElement);
    
    // 1.5秒后隐藏文字
    setTimeout(() => {
        textElement.remove();
    }, 1500);
}

// 显示建筑介绍页面
function showBuildingIntro() {
    // 隐藏当前路线内容
    if (currentRoute === 'land') {
        document.getElementById('land-route-content').classList.add('hidden');
    } else if (currentRoute === 'sea') {
        document.getElementById('sea-route-content').classList.add('hidden');
    }

    // 显示建筑介绍页面
    const buildingIntro = document.getElementById('building-intro');
    buildingIntro.classList.remove('hidden');

    // 填充建筑数据
    const buildingInfo = buildingData[currentRoute][currentStation][currentBuilding];
    document.getElementById('building-title').textContent = buildingInfo.title;
    document.getElementById('building-image').style.backgroundColor = buildingInfo.color || '#8B8B8B';
    document.getElementById('building-description').textContent = buildingInfo.description;

    // 更新收集进度
    const completedBuildings = (currentRoute === 'land' ? landRouteCompletedBuildings.length : seaRouteCompletedBuildings.length) + 1;
    document.getElementById('collection-progress').textContent = `${completedBuildings}/4`;

    // 清空结构点
    document.querySelector('.structure-points').innerHTML = '';

    // 显示建筑信息
    document.getElementById('building-image').style.border = '2px solid black';
    
    // 显示结构点
    /*if (buildingInfo.structures) {
        buildingInfo.structures.forEach(structure => {
            const point = document.createElement('div');
            point.className = 'structure-point';
            point.style.left = structure.x + '%';
            point.style.top = structure.y + '%';
            point.style.backgroundColor = buildingInfo.color || '#8B8B8B';
            point.addEventListener('click', () => showInfoCard(structure, buildingInfo.color));
            document.querySelector('.structure-points').appendChild(point);
        });
    }*/
    
    // 显示手稿
    document.querySelector('.manuscript').classList.remove('hidden');
    
    // 显示旅人笔记
    document.querySelector('.traveler-note').classList.remove('hidden');
    
    // 显示下一站按钮
    document.getElementById('next-building').classList.remove('hidden');
    
    // 更新进度条
    updateProgressBar();
    
    // 显示获得土和手稿的创新展示
    showEarthAndManuscript(buildingInfo, completedBuildings);
}

// 显示获得土和手稿的创新展示
function showEarthAndManuscript(buildingInfo, count) {
    // 移除已存在的展示容器（防止重复）
    const existingContainer = document.querySelector('.earth-manuscript-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // 创建展示容器 - 第一步：只显示土的信息
    const container = document.createElement('div');
    container.className = 'earth-manuscript-container active';
    container.innerHTML = `
        <div class="earth-manuscript-content step1">
            <div class="earth-section">
                <div class="earth-icon"></div>
                <h2>获得一捧土</h2>
                <p>您探索了<strong>${buildingInfo.title}</strong></p>
                <p>这是您收集的第<strong>${count}</strong>捧土</p>
                <div class="earth-color" style="background-color: ${buildingInfo.color || '#8B8B8B'}"></div>
            </div>
            
            <button class="show-manuscript-btn" onclick="showManuscriptStep()">查看手稿</button>
        </div>
    `;
    document.body.appendChild(container);
    
    // 存储建筑信息供下一步使用
    window.currentBuildingName = buildingInfo.title;
    window.currentColor = buildingInfo.color;
}

// 显示信息卡
function showInfoCard(structure, color) {
    const infoCard = document.getElementById('info-card');
    document.getElementById('info-title').textContent = structure.name;
    document.getElementById('info-desc').textContent = structure.description;
    // 设置信息卡边框颜色
    infoCard.style.borderColor = color || '#8B8B8B';
    infoCard.classList.remove('hidden');
    
    // 点击空白处关闭
    infoCard.addEventListener('click', (e) => {
        if (e.target === infoCard) {
            infoCard.classList.add('hidden');
        }
    });
}

// 显示风土弹窗
function show风土Popup() {
    const popup = document.getElementById('风土-popup');
    document.getElementById('popup-title').textContent = '风土人情';
    document.getElementById('popup-desc').textContent = '这里展示了当地的风土人情和建筑特色...';
    popup.classList.remove('hidden');
    
    // 点击空白处关闭
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.add('hidden');
        }
    });
}

// 更新进度条
function updateProgressBar() {
    const totalBuildings = 4;
    const completedBuildings = (landRouteCompletedBuildings.length + seaRouteCompletedBuildings.length);
    const progress = (completedBuildings / totalBuildings) * 100;
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
        progressFill.style.maxWidth = '80%';
    }
}

// 检查路线是否完成
function checkRouteCompletion() {
    let allStationsCompleted = true;
    let routeContent;

    if (currentRoute === 'land') {
        routeContent = document.getElementById('land-route-content');
    } else if (currentRoute === 'sea') {
        routeContent = document.getElementById('sea-route-content');
    }

    const stations = routeContent.querySelectorAll('.station');
    stations.forEach(station => {
        const buttons = station.querySelectorAll('.explore-building');
        buttons.forEach(button => {
            if (!button.disabled) {
                allStationsCompleted = false;
            }
        });
    });

    // 如果所有站点都已完成，显示探索新路线按钮
    if (allStationsCompleted) {
        if (!completedRoutes.includes(currentRoute)) {
            completedRoutes.push(currentRoute);
        }

        if (currentRoute === 'land' && !completedRoutes.includes('sea')) {
            document.getElementById('explore-sea-route').classList.remove('hidden');
        } else if (currentRoute === 'sea' && !completedRoutes.includes('land')) {
            document.getElementById('explore-land-route').classList.remove('hidden');
        } else {
            // 两条路线都已完成，显示最终收尾
            setTimeout(() => {
                showFinal();
            }, 1000);
        }
    }
}

// 显示最终收尾
function showFinal() {
    // 隐藏所有场景
    document.querySelectorAll('.scene').forEach(scene => {
        scene.classList.add('hidden');
    });

    // 显示最终收尾场景
    const finalScene = document.getElementById('final');
    finalScene.classList.remove('hidden');
    
    // 清空最终场景
    finalScene.innerHTML = '';
    
    // 显示丝路全景过渡画面（1秒）
    const silkRoadPanorama = document.createElement('div');
    silkRoadPanorama.className = 'silk-road-panorama';
    finalScene.appendChild(silkRoadPanorama);
    
    setTimeout(() => {
        // 移除全景图
        silkRoadPanorama.remove();
        
        // 创建总结页
        const summaryPage = document.createElement('div');
        summaryPage.className = 'summary-page';
        
        // 添加图标容器
        const iconsContainer = document.createElement('div');
        iconsContainer.className = 'final-icons';
        
        // 囊图标
        const pouchContainer = document.createElement('div');
        pouchContainer.className = 'icon-container';
        const pouchIcon = document.createElement('div');
        pouchIcon.className = 'pouch-icon';
        const pouchTooltip = document.createElement('div');
        pouchTooltip.className = 'tooltip';
        pouchTooltip.textContent = '囊藏丝路土，载尽沿途风土';
        pouchContainer.appendChild(pouchIcon);
        pouchContainer.appendChild(pouchTooltip);
        iconsContainer.appendChild(pouchContainer);
        
        // 手稿图标
        const manuscriptContainer = document.createElement('div');
        manuscriptContainer.className = 'icon-container';
        const manuscriptIcon = document.createElement('div');
        manuscriptIcon.className = 'manuscript-icon';
        const manuscriptTooltip = document.createElement('div');
        manuscriptTooltip.className = 'tooltip';
        manuscriptTooltip.textContent = '笔绘建筑魂，记录文明交融';
        manuscriptContainer.appendChild(manuscriptIcon);
        manuscriptContainer.appendChild(manuscriptTooltip);
        iconsContainer.appendChild(manuscriptContainer);
        
        summaryPage.appendChild(iconsContainer);
        finalScene.appendChild(summaryPage);
    }, 1000);
}