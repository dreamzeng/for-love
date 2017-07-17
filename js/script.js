/**
 * 容器的移动
 * [Swipe description]
 * @param {[type]} container [页面容器节点]
 * @param {[type]} options   [参数]
 */
function Swipe(container){
    // 获取第一个子节点
    var element = container.find(":first");

    //滑动对象
    var swipe = {};

    // li页面数量
    //var slides = element.find("li");
    var slides = element.find(" > li");
    // 获取容器尺寸
    var width = container.width();
    var height = container.height();
    // 设置li页面总宽度
    element.css({
        width  : (slides.length * width) + 'px',
        height : height + 'px'
    });
    // 设置每一个页面li的宽度
    $.each(slides, function(index) {
        var slide = slides.eq(index); //获取到每一个li元素    
        slide.css({
            width  : width + 'px',
            height : height + 'px'
        });
    });
    //监控完成与移动
    swipe.scrollTo = function(x, speed) {
        //执行动画移动
        element.css({
            'transition-timing-function' : 'linear',
            'transition-duration'        : speed + 'ms',
            'transform'                  : 'translate3d(-' + x + 'px,0px,0px)'
        });
        return this;
    };
    return swipe;
}

/***** 分割线 ****/

/**
    开关门是2组动画，需要2组transition的实现
    开关门是否完成，是需要监听2个动画是否完成才可以
    为了支持线性编程的逻辑，需要通过Deferred改善代码
*/
function doorAction(left, right, time) {
    var $door = $('.door');
    var doorLeft = $('.door-left');
    var doorRight = $('.door-right');
    var defer = $.Deferred();
    var count = 2;
    // 等待开门完成
    var complete = function() {
        if (count == 1) {
            defer.resolve();
            return;
        }
        count--;
    };
    doorLeft.transition({
        'left': left
    }, time, complete);
    
    doorRight.transition({
        'left': right
    }, time, complete);
    
    return defer;
}
/**
    开门的left的坐标是往反向变化，所以变化的值是：
    左边0%到-50%  
    右边50%到100%
*/
// 开门
function openDoor() {
    return doorAction('-50%', '100%', 2000);
}

// 关门
function shutDoor() {
    return doorAction('0%', '50%', 2000);
}

///////////
// 灯动画 //
///////////
var lamp = {
    elem: $('.b_background'),
    bright: function() {
        this.elem.addClass('lamp-bright');
    },
    dark: function() {
        this.elem.removeClass('lamp-bright');
    }
};

/***** 分割线 ****/

var instanceX;
  
/**
 * 小孩走路
 * @param {[type]} container [description]
 */
function BoyWalk() {

    var container = $("#content");
    // 页面可视区域
    var visualWidth = container.width();
    var visualHeight = container.height();

    // 获取数据
    var getValue = function(className) {
        var $elem = $('' + className + '');
            // 走路的路线坐标
        return {
            height: $elem.height(),
            top: $elem.position().top
        };
    };
    // 路的Y轴
    var pathY = function() {
        var data = getValue('.a_background_middle');
        return data.top + data.height / 2;
    }();
    var $boy = $("#boy");
    var boyWidth = $boy.width();
    var boyHeight = $boy.height();
    /**
     * 人物坐标的算法
     * 路的中间位置减去小孩的高度，25是一个修正值
     */
    // 修正小男孩的正确位置
    $boy.css({
        top: pathY - boyHeight + 25
    });

    // 暂停走路
    function pauseWalk() {
        $boy.addClass('pauseWalk');
    }

    // 恢复走路
    function restoreWalk() {
        $boy.removeClass('pauseWalk');
    }

    // css3的动作变化
    function slowWalk() {
        $boy.addClass('slowWalk');
    }

    // 用transition做运动
    function stratRun(options, runTime) {
        var dfdPlay = $.Deferred();
        // 恢复走路
        restoreWalk();
        // 运动的属性
        $boy.transition(
            options,
            runTime,
            'linear',
            function() {
                dfdPlay.resolve(); // 动画完成
            });
        return dfdPlay;
    }

    // 开始走路
    function walkRun(time, dist, disY) {
        time = time || 3000;
        // 脚动作
        slowWalk();
        // 开始走路
        var d1 = stratRun({
            'left': dist + 'px',
            'top': disY ? disY : undefined
        }, time);
        return d1;
    }

    /**
        小男孩走进门的中间位置,具体的算法比较简单：

        translateX = 门中间的left值 - 小男孩中间的left值
        translateY = 人物底部的top值 - 门中间的top值

        这里的取值采用jQuery的offset处理的，注意下position与offset的取值不同点，
        .offset()是相对于文档（document）的当前位置,.position()是相对于父级元素的位移，
        一个元素可以嵌套多个position所以这里要特别注意下。

        在实际的的进门路线的处理中，代码是采用translateX + scale的组合，并没有采用translateY，
        原因就是scale是一个缩放效果，在实际上会有替代translateY这个Y轴变化的感觉，
        具体我们可以参考代码部分的处理
    */

    // 走进商店
    function walkToShop(runTime) {
        var defer = $.Deferred();
        var doorObj = $('.door')
        // 门的坐标
        var offsetDoor = doorObj.offset();
        var doorOffsetLeft = offsetDoor.left;
        // 小孩当前的坐标
        var offsetBoy     = $boy.offset();
        var boyOffetLeft = offsetBoy.left;

        // 当前需要移动的坐标
        instanceX = (doorOffsetLeft + doorObj.width() / 2) - (boyOffetLeft + $boy.width() / 2);

        // 开始走路
        var walkPlay = stratRun({
            transform: 'translateX(' + instanceX + 'px),scale(0.3,0.3)',
            opacity: 0.1
        }, 2000);
        // 走路完毕
        walkPlay.done(function() {
            $boy.css({
                opacity: 0
            })
            defer.resolve();
        })
        return defer;
    }

    // 走出店
    function walkOutShop(runTime) {
        var defer = $.Deferred();
        restoreWalk();
        //开始走路
        var walkPlay = stratRun({
            transform: 'translateX(' + instanceX + 'px),scale(1,1)',
            opacity: 1
        }, runTime);
        //走路完毕
        walkPlay.done(function() {
            defer.resolve();
        });
        return defer;     
    }
    // 取花
    function talkFlower() {
        // 增加延时等待效果
        var defer = $.Deferred();
        setTimeout(function() {
            // 取花
            $boy.addClass('slowFlolerWalk');
            defer.resolve();
        }, 1000);
        return defer;
    }

    // 计算移动距离
    function calculateDist(direction, proportion) {
        console.log(visualWidth,visualWidth*proportion)
        return (direction == "x" ?
            visualWidth : visualHeight) * proportion;
    }

    return {
        // 开始走路
        walkTo: function(time, proportionX, proportionY) {
            //目标移动到指定的位置
            var distX = calculateDist('x', proportionX)
            var distY = calculateDist('y', proportionY)
            return walkRun(time, distX, distY);
        },
        // 走进商店
        toShop: function() {
            return walkToShop.apply(null, arguments);
        },
        // 走出商店
        outShop: function() {
            return walkOutShop.apply(null, arguments);
        }, 
        // 取花
        talkFlower: function() {
            return talkFlower();
        },
        // 停止走路
        stopWalk: function() {
            pauseWalk();
        },
        setColoer:function(value){
            $boy.css('background-color',value)
        },
        // 获取男孩的宽度
        getWidth: function() {
            return $boy.width();
        },
        // 复位初始状态
        resetOriginal: function() {
            this.stopWalk();
            // 恢复图片
            $boy.removeClass('slowWalk slowFlolerWalk').addClass('boyOriginal');
        },
        setFlolerWalk:function(){
             $boy.addClass('slowFlolerWalk');
        },
        // 转身动作
        rotate: function(callback) {
           restoreWalk();
           $boy.addClass('boy-rotate');
           // 监听转身完毕
           if (callback) {
                callback();
           }
       }
       
    }
}


/**
    实现原理：

    通过定时器调用JS代码不断的动态创建雪花节点，随机选择一个图片作为其背景，赋予三个初始的样式属性top,left与opacity，通过transition动画过度的方式执行这3个属性的动画变化。整个原理其实也是很简单的，主要涉及了一些细节的问题：例如元素的创建、图片的随机、开始的left与opacity的随机处理、最终值的计算等等

    执行的流程：

    getImagesName随机6张图片，snowflakeURl定义一个地址的范围
    createSnowBox创建雪花元素的节点，并且增加一个snowRoll的样式，也就是旋转的关键帧实现
    定时器设置200ms不断的生成雪花对象，计算出3个属性的初始值，通过createSnowBox创建雪花元素，并且附上初始值，然后执行transition附上最终值，执行动画
    动画结束后执行$(this).remove()  删除这个对象

*/

var snowflakeURl = [
    'images/snowflake/snowflake1.png',
    'images/snowflake/snowflake2.png',
    'images/snowflake/snowflake3.png',
    'images/snowflake/snowflake4.png',
    'images/snowflake/snowflake5.png',
    'images/snowflake/snowflake6.png'
]

///////
//飘雪花 //
///////
function snowflake() {
    var container = $("#content");
    var visualWidth = container.width();
    var visualHeight = container.height();
    // 雪花容器
    var $flakeContainer = $('#snowflake');

    // 随机六张图
    function getImagesName() {
        return snowflakeURl[[Math.floor(Math.random() * 6)]];
    }
    // 创建一个雪花元素
    function createSnowBox() {
        var url = getImagesName();
        return $('<div class="snowbox" />').css({
            'width': 41,
            'height': 41,
            'position': 'absolute',
            'backgroundSize': 'cover',
            'zIndex': 100000,
            'top': '-41px',
            'backgroundImage': 'url(' + url + ')'
        }).addClass('snowRoll');
    }
    // 开始飘花
    setInterval(function() {
        // 运动的轨迹
        var startPositionLeft = Math.random() * visualWidth - 100,
            startOpacity    = 1,
            endPositionTop  = visualHeight - 40,
            endPositionLeft = startPositionLeft - 100 + Math.random() * 500,
            duration        = visualHeight * 10 + Math.random() * 5000;

        // 随机透明度，不小于0.5
        var randomStart = Math.random();
        randomStart = randomStart < 0.5 ? startOpacity : randomStart;

        // 创建一个雪花
        var $flake = createSnowBox();

        // 设计起点位置
        $flake.css({
            left: startPositionLeft,
            opacity : randomStart
        });

        // 加入到容器
        $flakeContainer.append($flake);

        // 开始执行动画
        $flake.transition({
            top: endPositionTop,
            left: endPositionLeft,
            opacity: 0.7
        }, duration, 'ease-out', function() {
            $(this).remove() //结束后删除
        });
        
        }, 200);
}

/**
    背景音乐很简单，可以直接用HTML5的audio元素播放。
    在HTML5标准网页里面，我们可以运用audio标签来完成我们对声音的调用及播放。

    使用：

    var audio = new Audio(url);   //创建一个音频对象并传入地址
    audio.loop  = loop ||  false; //是否循环
    audio.play(); //开始播放
    传递一个视频的地址，创建一个Audio对象，设置属性loop是否循环播放，然后调用play方法就可以实现播放了
*/

// 音乐配置
var audioConfig = {
    enable: true, // 是否开启音乐
    playURl1: 'music/happy.wav',// 播放地址
    playURl2: 'music/seeYou.mp3'
};

/////////
//背景音乐 //
/////////
function Hmlt5Audio(url, isloop) {
    var audio = new Audio(url);
    audio.autoPlay = true;
    audio.loop = isloop || false;
    audio.play();
    return {
        end: function(callback) {
            audio.addEventListener('ended', function() {
                callback();
            }, false);
        }
    };
}
var openAudio = function(){
 
    var audio1 = Hmlt5Audio(audioConfig.playURl1);
    audio1.end(function() {
        Hmlt5Audio(audioConfig.playURl2, true);
    });
}