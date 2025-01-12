<template>
	<div class="article-form-container">
		<el-form :model="form" :rules="rules" ref="form" label-width="120px" class="article-form article-form-left">
			<el-form-item label="文章标题" prop="articleTitle">
				<el-input v-model="form.articleTitle" placeholder="请输入文章标题"></el-input>
			</el-form-item>

			<el-form-item label="承办方" prop="organizer">
				<el-input v-model="form.organizer" placeholder="请输入承办方"></el-input>
			</el-form-item>

			<el-form-item label="截止日期" prop="endTime">
				<el-date-picker v-model="form.endTime" type="datetime" placeholder="选择截止日期和时间" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm"></el-date-picker>
			</el-form-item>

			<el-form-item label="活动地点" prop="activityAddress">
				<el-input v-model="form.activityAddress" placeholder="请选择活动地点" class="input-with-search" readonly>
					<el-button slot="append" icon="el-icon-location" @click="openMap"></el-button>
				</el-input>
				<input type="hidden" v-model="form.longitude" />
				<input type="hidden" v-model="form.latitude" />
				<input type="hidden" v-model="form.province" />
				<input type="hidden" v-model="form.city" />
				<input type="hidden" v-model="form.area" />
			</el-form-item>

			<el-form-item label="图片上传" required>
				<el-col :span="11">
					<el-form-item prop="thumbnail">
						<span class="image-label">缩略图</span>
						<image-upload ref="thumbnailImage" :value="form.thumbnail" :limit="1" />
					</el-form-item>
				</el-col>
				<el-col :span="2">&nbsp;</el-col>
				<el-col :span="11">
					<el-form-item prop="wXImg">
						<span class="image-label">微信封面图</span>
						<image-upload ref="wXImgImage" :value="form.wXImg" :limit="1" />
					</el-form-item>
				</el-col>
			</el-form-item>

			<el-form-item label="文章摘要" prop="wXSummary">
				<el-input type="textarea" v-model="form.wXSummary" placeholder="请输入文章摘要"></el-input>
			</el-form-item>

			<el-form-item label="文章内容" prop="articleContent">
				<editor v-model="form.articleContent" :height="300" />
			</el-form-item>

			<el-form-item label="礼品清单" prop="catArticlegiftTableList">
				<el-button @click="addGift" type="primary" size="small" style="margin-bottom: 10px">添加礼品</el-button>
				<el-table :data="form.catArticlegiftTableList" style="width: 100%" border stripe>
					<el-table-column prop="giftImg" label="礼品图片" width="180" align="center">
						<template slot-scope="scope">
							<image-upload :ref="'giftImage' + scope.$index" :value="scope.row.giftImg" :limit="1" />
						</template>
					</el-table-column>
					<el-table-column prop="giftTitle" label="礼品标题" align="center">
						<template slot-scope="scope">
							<el-input v-model="scope.row.giftTitle" placeholder="请输入礼品标题"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="giftRequire" label="获取要求" align="center">
						<template slot-scope="scope">
							<el-input v-model="scope.row.giftRequire" placeholder="请输入获取要求"></el-input>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="100" align="center">
						<template slot-scope="scope">
							<el-button @click="removeGift(scope.$index)" type="danger" size="small">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-form-item>

			<el-form-item label="文章归属" prop="phone">
				<el-input v-model="form.phone" placeholder="请输入手机号搜索" class="input-with-search">
					<el-button slot="append" icon="el-icon-search" @click="searchUserId"></el-button>
				</el-input>
				<span style="margin-left: 24px">{{ userInfo ? userInfo.nickName : '' }}</span>
			</el-form-item>

			<el-form-item label="目标阅读量" prop="targetNum">
				<div class="flex-container">
					<el-input v-model="form.targetNum" :min="0" placeholder="请输入目标阅读量" style="width: 300px" @input="handleTargetNumChange"></el-input>
					<div v-if="baseCost" style="margin-left: 12px">= ￥ {{ baseCost }}</div>
					<el-button type="primary" @click="generatePaymentOrder" style="width: 150px; margin-left: 12px">生成付款订单 </el-button>
				</div>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="onSubmit">保存</el-button>
				<el-button @click="onCancel">取消</el-button>
			</el-form-item>
		</el-form>

		<el-dialog title="付款二维码" :visible.sync="showPaymentDialog">
			<div v-if="paymentQRCode" class="qr-code-container">
				<img :src="paymentQRCode" alt="付款二维码" />
			</div>
			<div v-else class="loading-container">
				<el-spinner type="spinner"></el-spinner>
				<p>正在生成二维码，请稍候...</p>
			</div>
		</el-dialog>

		<el-dialog title="选择地点" :visible.sync="showMap" width="80%">
			<div class="map-controls">
				<el-select v-model="selectedProvince" placeholder="选择省份" @change="handleProvinceChange">
					<el-option v-for="item in provinces" :key="item.id" :label="item.fullname" :value="item.id"></el-option>
				</el-select>
				<el-select v-model="selectedCity" placeholder="选择城市" @change="handleCityChange">
					<el-option v-for="item in cities" :key="item.id" :label="item.fullname" :value="item.id"></el-option>
				</el-select>
				<el-select v-model="selectedDistrict" placeholder="选择区域" @change="handleDistrictChange">
					<el-option v-for="item in districts" :key="item.id" :label="item.fullname" :value="item.id"></el-option>
				</el-select>
			</div>
			<div id="map-container" style="height: 500px"></div>
		</el-dialog>
	</div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload/index.vue';
import Editor from '@/components/Editor/index.vue';
import CryptoJS from 'crypto-js';
import { addTable, createCodePayOrder, getBaseCost, getTable, getUserInfoByPhone, updateTable } from '@/api/system/list';

export default {
	components: {
		ImageUpload,
		Editor
	},
	data() {
		return {
			userInfo: { nickName: '' },
			form: {
				articleTitle: '',
				organizer: '',
				endTime: '',
				activityAddress: '',
				longitude: '',
				latitude: '',
				province: '',
				city: '',
				area: '',
				thumbnail: '',
				wXImg: '',
				wXSummary: '',
				articleContent: '',
				catArticlegiftTableList: [],
				userId: '',
				phone: '',
				targetNum: 0
			},
			rules: {
				articleTitle: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
				organizer: [{ required: true, message: '请输入承办方', trigger: 'blur' }],
				endTime: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
				activityAddress: [{ required: true, message: '请选择活动地点', trigger: 'change' }],
				thumbnail: [{ required: true, message: '请上传缩略图', trigger: 'change' }],
				wXImg: [{ required: true, message: '请上传微信封面图', trigger: 'change' }],
				wXSummary: [{ required: true, message: '请输入文章摘要', trigger: 'blur' }],
				articleContent: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
				catArticlegiftTableList: [{ required: true, message: '请添加至少一个礼品', trigger: 'change' }],
				userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
				phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
				targetNum: [{ required: true, message: '请输入目标阅读量', trigger: 'change' }]
			},
			showPaymentDialog: false,
			paymentQRCode: '',
			showMap: false,
			mapCenter: { lat: 39.90923, lng: 116.397428 },
			map: null,
			marker: null,
			secretKey: 'FzmFz7gegFComdybMZ5EyTM0i6xRrieu',
			provinces: [],
			cities: [],
			districts: [],
			selectedProvince: '',
			selectedCity: '',
			selectedDistrict: '',
			isPay: false,
			baseCost: 0
		};
	},
	created() {
		let id = this.$route.query.id;
		if (id) {
			getTable(id).then(response => {
				this.form = response.data;
				if (this.form.phone) {
					this.searchUserId();
				}
			});
		}
		this.loadProvinces();
	},
	methods: {
		handleTargetNumChange(val) {
			//校验只能输入正整数
			this.form.targetNum = val.replace(/[^\d]/g, '');
			getBaseCost().then(res => {
				this.baseCost = res.data.baseCost;
			});
		},
		addGift() {
			this.form.catArticlegiftTableList.push({
				giftImg: '',
				giftTitle: '',
				giftRequire: ''
			});
		},
		removeGift(index) {
			this.form.catArticlegiftTableList.splice(index, 1);
		},
		onSubmit() {
			if (this.$refs.thumbnailImage.fileList.length !== 0) {
				this.form.thumbnail = this.$refs.thumbnailImage.fileList[0].url;
			}
			if (this.$refs.wXImgImage.fileList.length !== 0) {
				this.form.wXImg = this.$refs.wXImgImage.fileList[0].url;
			}
			for (let i = 0; i < this.form.catArticlegiftTableList.length; i++) {
				if (this.$refs[`giftImage${i}`].fileList.length === 0) {
					this.$message.error(`请上传第${i + 1}个礼品的图片`);
					return;
				}
				let item = this.form.catArticlegiftTableList[i];
				if (item.giftTitle.length === 0) {
					this.$message.error(`请输入第${i + 1}个礼品的标题`);
					return;
				}
				if (item.giftRequire.length === 0) {
					this.$message.error(`请输入第${i + 1}个礼品的要求`);
					return;
				}
			}
			this.form.catArticlegiftTableList.forEach((item, index) => {
				item.giftImg = this.$refs[`giftImage${index}`]?.fileList[0]?.url || '';
			});
			this.$refs.form.validate(valid => {
				if (valid) {
					if (this.form.id) {
						updateTable(this.form).then(res => {
							this.$message({
								type: 'success',
								message: '更新成功'
							});
							// 关闭当前tab页签
							setTimeout(() => {
								this.$tab.closePage();
							}, 1000);
						});
					} else {
						addTable(this.form).then(res => {
							this.$message({
								type: 'success',
								message: '添加成功'
							});
							// 关闭当前tab页签
							setTimeout(() => {
								this.$tab.closePage();
							}, 1000);
						});
					}
				} else {
					console.log('Form validation failed');
					return false;
				}
			});
		},
		onCancel() {
			this.$refs.form.resetFields();
			console.log('Form cancelled');
			// 在这里添加取消操作逻辑
			this.$tab.closePage();
		},
		searchUserId() {
			if (!this.form.phone) {
				this.$message.error('请输入手机号');
				return;
			}
			getUserInfoByPhone({ phone: this.form.phone }).then(res => {
				if (res.data && res.data.length > 0) {
					this.form.userId = res.data[0].id;
					this.userInfo = res.data[0];
				} else {
					this.$message.error('未找到用户信息');
					return;
				}
			});
		},
		generatePaymentOrder() {
			if (!this.form.userId) {
				this.$message.error('请先搜索用户ID');
				return;
			}
			// 实现生成付款订单逻辑
			createCodePayOrder({
				// 文章ID
				id: this.form.id,
				// 目标数量
				targetNum: this.form.targetNum,
				// 用户ID
				userId: this.form.userId
			})
				.then(res => {
					this.paymentQRCode = res.data;
					this.showPaymentDialog = true;
				})
				.catch(error => {
					this.paymentQRCode = 'https://example.com/qr-code.png'; // 这里应该是实际的二维码图片URL
				});
		},
		openMap() {
			this.showMap = true;
			this.$nextTick(() => {
				this.initMap();
			});
		},
		initMap() {
			if (typeof qq === 'undefined' || typeof qq.maps === 'undefined') {
				console.error('腾讯地图 API 未加载');
				return;
			}
			const center = new qq.maps.LatLng(this.mapCenter.lat, this.mapCenter.lng);
			this.map = new qq.maps.Map(document.getElementById('map-container'), {
				center: center,
				zoom: 13
			});

			qq.maps.event.addListener(this.map, 'click', event => {
				this.updateMarker(event.latLng);
				this.getAddress(event.latLng);
			});
		},
		updateMarker(latLng) {
			if (this.marker) {
				this.marker.setMap(null);
			}
			this.marker = new qq.maps.Marker({
				position: latLng,
				map: this.map
			});
		},
		generateSignature(params, path = '/ws/district/v1/list') {
			const sortedParams = Object.keys(params)
				.sort()
				.map(key => `${key}=${params[key]}`)
				.join('&');
			const signStr = `${path}?${sortedParams}${this.secretKey}`;
			return CryptoJS.MD5(signStr).toString();
		},
		getAddress(latLng) {
			const params = {
				location: `${latLng.lat},${latLng.lng}`,
				key: 'BKNBZ-VIDK7-PWUXP-HU2J7-EIOAQ-XCB7L',
				output: 'json'
			};
			const sig = this.generateSignature(params, '/ws/geocoder/v1');

			const url = `/map-api/ws/geocoder/v1?${new URLSearchParams(params)}&sig=${sig}`;

			fetch(url)
				.then(response => response.json())
				.then(data => {
					if (data.status === 0) {
						const result = data.result;
						this.form.longitude = result.location.lng;
						this.form.latitude = result.location.lat;
						this.form.province = result.address_component.province;
						this.form.city = result.address_component.city;
						this.form.area = result.address_component.district;
						this.form.activityAddress = result.address;

						// Update selectedProvince, selectedCity, and selectedDistrict
						this.selectedProvince = this.provinces.find(p => p.fullname === result.address_component.province)?.id || '';
						this.handleProvinceChange();
						this.selectedCity = this.cities.find(c => c.fullname === result.address_component.city)?.id || '';
						this.handleCityChange();
						this.selectedDistrict = this.districts.find(d => d.fullname === result.address_component.district)?.id || '';

						this.showMap = false;
					} else {
						console.error('获取地址信息失败:', data);
						this.$message.error('获取地址信息失败，请重试');
					}
				})
				.catch(error => {
					console.error('获取地址信息出错:', error);
					this.$message.error('获取地址信息失败，请重试');
				});
		},
		loadProvinces() {
			const params = {
				key: 'BKNBZ-VIDK7-PWUXP-HU2J7-EIOAQ-XCB7L',
				output: 'json'
			};
			const sig = this.generateSignature(params);

			const url = `/map-api/ws/district/v1/list?${new URLSearchParams(params)}&sig=${sig}`;

			fetch(url)
				.then(response => response.json())
				.then(data => {
					if (data.status === 0) {
						this.provinces = data.result[0];
					} else {
						console.error('获取省份列表失败:', data);
						this.$message.error('获取省份列表失败，请重试');
					}
				})
				.catch(error => {
					console.error('获取省份列表出错:', error);
					this.$message.error('获取省份列表失败，请重试');
				});
		},
		loadCities() {
			if (!this.selectedProvince) {
				this.cities = [];
				this.districts = [];
				return;
			}

			const params = {
				key: 'BKNBZ-VIDK7-PWUXP-HU2J7-EIOAQ-XCB7L',
				id: this.selectedProvince,
				output: 'json'
			};
			const sig = this.generateSignature(params, '/ws/district/v1/getchildren');

			const url = `/map-api/ws/district/v1/getchildren?${new URLSearchParams(params)}&sig=${sig}`;

			fetch(url)
				.then(response => response.json())
				.then(data => {
					if (data.status === 0) {
						this.cities = data.result[0];
					} else {
						console.error('获取城市列表失败:', data);
						this.$message.error('获取城市列表失败，请重试');
					}
				})
				.catch(error => {
					console.error('获取城市列表出错:', error);
					this.$message.error('获取城市列表失败，请重试');
				});
		},
		loadDistricts() {
			if (!this.selectedCity) {
				this.districts = [];
				return;
			}

			const params = {
				key: 'BKNBZ-VIDK7-PWUXP-HU2J7-EIOAQ-XCB7L',
				id: this.selectedCity,
				output: 'json'
			};
			const sig = this.generateSignature(params, '/ws/district/v1/getchildren');

			const url = `/map-api/ws/district/v1/getchildren?${new URLSearchParams(params)}&sig=${sig}`;

			fetch(url)
				.then(response => response.json())
				.then(data => {
					if (data.status === 0) {
						this.districts = data.result[0];
					} else {
						console.error('获取区域列表失败:', data);
						this.$message.error('获取区域列表失败，请重试');
					}
				})
				.catch(error => {
					console.error('获取区域列表出错:', error);
					this.$message.error('获取区域列表失败，请重试');
				});
		},
		handleProvinceChange() {
			this.loadCities();
			this.selectedCity = '';
			this.selectedDistrict = '';
			this.updateMapCenter();
		},
		handleCityChange() {
			this.loadDistricts();
			this.selectedDistrict = '';
			this.updateMapCenter();
		},
		handleDistrictChange() {
			this.updateMapCenter();
		},
		updateMapCenter() {
			const selectedArea = this.selectedDistrict || this.selectedCity || this.selectedProvince;
			if (!selectedArea) return;

			const params = {
				key: 'BKNBZ-VIDK7-PWUXP-HU2J7-EIOAQ-XCB7L',
				id: selectedArea,
				output: 'json'
			};
			const sig = this.generateSignature(params, '/ws/district/v1/getchildren');

			const url = `/map-api/ws/district/v1/getchildren?${new URLSearchParams(params)}&sig=${sig}`;

			fetch(url)
				.then(response => response.json())
				.then(data => {
					if (data.status === 0 && data.result[0] && data.result[0].length > 0) {
						const location = data.result[0][0].location;
						const newCenter = new qq.maps.LatLng(location.lat, location.lng);
						this.map.setCenter(newCenter);
						this.updateMarker(newCenter);
					} else {
						console.error('获取地区中心坐标失败:', data);
						this.$message.error('获取地区中心坐标失败，请重试');
					}
				})
				.catch(error => {
					console.error('获取地区中心坐标出错:', error);
					this.$message.error('获取地区中心坐标失败，请重试');
				});
		}
	}
};
</script>

<style>
.article-form-container {
	width: 100%;
}

.article-form {
	width: 100%;
}

.article-form-left {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.article-form-left .el-form-item {
	width: 100%;
}

.article-form-left .el-input,
.article-form-left .el-date-editor {
	width: 400px !important;
}

.article-form-left .el-textarea,
.article-form-left .el-input-number,
.article-form-left .image-upload,
.article-form-left .editor {
	width: 100%;
}

.article-form-container .el-form {
	padding: 40px;
}

.input-with-search .el-input-group__append {
	background-color: #409eff;
	border-color: #409eff;
	color: #fff;
}

.image-label {
	display: block;
	margin-bottom: 5px;
}

.qr-code-container {
	display: flex;
	justify-content: center;
	align-items: center;
}

.qr-code-container img {
	max-width: 200px;
	max-height: 200px;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 200px;
}

.flex-container {
	display: flex;
	align-items: center;
}

.map-controls {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
}

.map-controls .el-select {
	width: 30%;
}
</style>
