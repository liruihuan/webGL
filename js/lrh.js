(function (Win, LRH) {

	function PressEvent(element, onlyClick, pressClick, moveHandle) {
		let xStart = xEnd = yStart = yEnd = timer = null,
			press = false;

		const doc = Win.document;
		this.onlyClick = typeof onlyClick === 'function' ? onlyClick : new Function();
		this.pressClick = typeof pressClick === 'function' ? pressClick : new Function();
		this.moveHandle = typeof moveHandle === 'function' ? moveHandle : new Function();
		this.targetElement = (element !== undefined) ? doc.querySelector(element) : doc || Win;
		this.targetElement.addEventListener('touchstart', (e) => {
			xStart = e.touches ? e.touches[0].clientX : e.clientX;
			yStart = e.touches ? e.touches[0].clientY : e.clientY;
			timer = setTimeout(() => {
				if (timer !== null) {
					press = true;
					try {
						this.pressClick(e)
					} catch (error) {
						console.error(error)
					}
				}
			}, 500)
		});
		this.targetElement.addEventListener('mousedown', (e) => {
			xStart = e.touches ? e.touches[0].clientX : e.clientX;
			yStart = e.touches ? e.touches[0].clientY : e.clientY;
			timer = setTimeout(() => {
				if (timer !== null) {
					press = true;
					try {
						this.pressClick(e)
					} catch (error) {
						console.error(error)
					}
				}
			}, 500)
		});
		this.targetElement.addEventListener('touchend', (e) => {
			clearTimeout(timer)
			xStart = xEnd = yStart = yEnd = timer = null;
			if (!press) {
				try {
					this.onlyClick(e)
				} catch (error) {
					console.error(error)
				}
			}
			press = false;
			
		});
		this.targetElement.addEventListener('mouseup', (e) => {
			clearTimeout(timer)
			xStart = xEnd = yStart = yEnd = timer = null;
			if (!press) {
				try {
					this.onlyClick(e)
				} catch (error) {
					console.error(error)
				}
			}
			press = false;
		});
		this.targetElement.addEventListener("mousemove", (e) => {
			this.tempDeclaration(e)
		});
		this.targetElement.addEventListener("touchmove", (e) => {
			this.tempDeclaration(e)
		});
		this.tempDeclaration = function (e) {
			if (!xStart)
				return;
			press = true; // 防止松开触发点击事件
			timer = null; // 防止移动时触发长按事件
			xEnd = e.touches ? e.touches[0].clientX : e.clientX;
			yEnd = e.touches ? e.touches[0].clientY : e.clientY;
			try {
				this.moveHandle(e, xStart, xEnd, yStart, yEnd)
				xStart = xEnd;
				yStart = yEnd;
			} catch (error) {
				console.error(error)
			}

		}

	};

	function TimeHandle() {
		this.parseBefore = function (time) {
			this.time = time || new Date;
			if (typeof this.time === 'object') {
				return this.time
			} else {
				if ((typeof this.time === 'string') && (/^[0-9]+$/.test(this.time))) {
					this.time = parseInt(this.time)
				}
				if ((typeof this.time === 'number') && (this.time.toString().length === 10)) {
					this.time = this.time * 1000
				}
				return new Date(this.time)
			}
		}
		this.parseTime = function (time, cFormat) {

			const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
			const date = this.parseBefore(time)
			const formatObj = {
				y: date.getFullYear(),
				m: date.getMonth() + 1,
				d: date.getDate(),
				h: date.getHours(),
				i: date.getMinutes(),
				s: date.getSeconds(),
				a: date.getDay()
			}
			const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
				let value = formatObj[key]
				if (key === 'a') {
					return ['日', '一', '二', '三', '四', '五', '六'][value]
				}
				if (result.length > 0 && value < 10) {
					value = '0' + value
				}
				return value || 0
			})
			return time_str
		};
		this.formatTime = function (time, option) {

			const d = this.parseBefore(time)
			const now = Date.now()

			const diff = (now - d) / 1000

			if (diff < 30) {
				return '刚刚'
			} else if (diff < 3600) {
				return Math.ceil(diff / 60) + '分钟前'
			} else if (diff < 3600 * 24) {
				return Math.ceil(diff / 3600) + '小时前'
			} else if (diff < 3600 * 24 * 2) {
				return '1天前'
			}
			if (option) {
				return this.parseTime(time, option)
			} else {
				return (
					d.getMonth() +
					1 +
					'月' +
					d.getDate() +
					'日' +
					d.getHours() +
					'时' +
					d.getMinutes() +
					'分'
				)
			}

		}
		this.sendMessageTime = function (timeObj) {

			let time = "";
			const createdTime = this.parseBefore(timeObj);
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
			const beforeYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
			const monday = new Date(today);
			monday.setDate(today.getDate() - (today.getDay() ? today.getDay() - 1 : 6));

			if (createdTime.getTime() > today.getTime()) {
				time = "";
			} else if (createdTime.getTime() > yesterday.getTime()) {
				time = "昨天";
			} else if (createdTime.getTime() > beforeYesterday.getTime()) {
				time = "前天";
			} else if (createdTime.getTime() > monday.getTime()) {
				const week = {
					"0": "星期日",
					"1": "星期一",
					"2": "星期二",
					"3": "星期三",
					"4": "星期四",
					"5": "星期五",
					"6": "星期六"
				};
				time = week[createdTime.getDay() + ""];
			} else {
				time = createdTime.getFullYear() + "年" + (createdTime.getMonth() +
					1) +
					'月' +
					createdTime.getDate() +
					'日'
			}
			time += (createdTime.getHours() > 12 ? ("下午" + (createdTime.getHours() - 12)) : ("上午" + createdTime.getHours())) + ":" + (createdTime.getMinutes() >= 10 ? createdTime.getMinutes() : "0" + createdTime.getMinutes());
			return time;

		}
	}
	function RemoveRepetition(array, key) {
		if (!Array.isArray(array)) {
			console.error('The first argument must be an array!')
			return;
		}
		const temp = array.every(function (element) {
			return typeof element === "object";
		})

		if (temp && !key) {
			console.error('No properties are defined in the parameter!')
			return;
		}

		this.array = array;
		this.key = key && temp ? key : false; // key为对象里面的属性
	}
	Object.assign(RemoveRepetition.prototype, {
		repetition: function () {
			if (this.key) {
				// 对象数组
				for (let i = 0; i < this.array.length-1; i++) {
					for (let j = i + 1; j < this.array.length; j++) {
						if (this.array[i][this.key] === this.array[j][this.key]) {
							this.array.splice(j, 1);
							j--;
						}
					}
				}
				return this.array
			} else {
				for (let i = 0; i < this.array.length-1; i++) {
					for (let j = i + 1; j < this.array.length; j++) {
						if (this.array[i] === this.array[j]) {
							this.array.splice(j, 1);
							j--;
						}
					}
				}
				return this.array
			}

		}

	})
	//
	function Rotate3D(element) {
		// offsetLeft,offsetTop值,当上级没有非静态定位以body为参考,当有非静态定位就以此上级为参考系
		// element的父级不要有非静态定位,offsetLeft,offsetTop要以body为参考系,否则可能不准确
		if (!element) return;
		this.element = element;
		this.parseDirection = Function;// 此方法供外部回调获取方向做一些操作
		const nodes = document.querySelectorAll(this.element),
			nodeLists = [].slice.call(nodes, 0);
		// div对角相连分成上下左右四个区域,判断鼠标进出方向
		// x坐标：e.pageX - offsetLeft - w/2  y坐标：e.pageY - offsetTop - h/2
		// Math.atan2(x,y)函数 相当于这个点的角度
		// 公式：弧度=角度乘以π后再除以180，角度=弧度除以π再乘以180　　
		// +180 原来的坐标轴是(-180,180)度的，加个180那么就都成正的，即(0,360)
		// /90 ：那为什么要除于90呢，要知道90，就必须理解  
		// (w > h ? (h / w) : 1)和 (h > w ? (w / h) : 1) 将矩形矫正成正方形,使两条对角线相交的那些角就都是90度
		// +3  角度区间是从右上方开始算起的，所以加三就是将第一区间变成上。顺序是 上右下左
		// %4取余，保证结果是0、1、2、3 之间的一个（分别代表上、右、下、左）。
		const getDirection = function (ev, obj) {
			const w = obj.offsetWidth,
				h = obj.offsetHeight,
				x = (ev.pageX - obj.offsetLeft - (w / 2)) * (w > h ? (h / w) : 1),
				y = (ev.pageY - obj.offsetTop - (h / 2)) * (h > w ? (w / h) : 1),
				d = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
			return d;
		};
		const _this = this;
		const addClass = function (ev, obj, state) {
			const direction = getDirection(ev, obj);
			_this.parseDirection(direction); // 传值
			let classSuffix = "";
			obj.className = "";
			switch (direction) {
				case 0: classSuffix = '-top'; break;
				case 1: classSuffix = '-right'; break;
				case 2: classSuffix = '-bottom'; break;
				case 3: classSuffix = '-left'; break;
			}

			obj.classList.add(state + classSuffix);
		};
		nodeLists.forEach(function (el) {
			el.addEventListener('mouseover', function (ev) {
				addClass(ev, this, 'in');
			}, false);

			el.addEventListener('mouseout', function (ev) {
				addClass(ev, this, 'out');
			}, false);
		});

	}
	LRH.PressEvent = PressEvent;
	LRH.TimeHandle = TimeHandle;
	LRH.RemoveRepetition = RemoveRepetition;
	LRH.Rotate3D = Rotate3D;
})(window, window['LRH'] || (window['LRH'] = {}))