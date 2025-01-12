<template>
	<div>
		<el-dialog title="选择地点" :visible.sync="showMap" width="80%">
			<div class="map-controls">
				<el-select v-model="selectedProvince" placeholder="选择省份" @change="handleProvinceChange">
					<el-option v-for="item in provinces" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>
				<el-select v-model="selectedCity" placeholder="选择城市" @change="handleCityChange">
					<el-option v-for="item in cities" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>
				<el-select v-model="selectedDistrict" placeholder="选择区域" @change="handleDistrictChange">
					<el-option v-for="item in districts" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</div>
			<div id="map-container" style="height: 500px"></div>
		</el-dialog>
	</div>
</template>
<script>
import { regionData, TextToCode } from 'element-china-area-data';
import CryptoJS from 'crypto-js';

export default {
	props: {
		mapCenter: {
			type: Object,
			default: () => {
				return {
					lat: 39.90923,
					lng: 116.397428
				};
			}
		},
		areaInfo: {
			type: Object,
			default: () => {
				return {
					province: '',
					city: '',
					district: ''
				};
			}
		}
	},
	watch: {
		mapCenter(newValue) {
			if (this.map) {
				const center = new qq.maps.LatLng(newValue.lat, newValue.lng);
				this.map.setCenter(center);
				this.updateMarker(center);
			}
		},
		areaInfo(newValue) {
			if (this.map) {
				this.selectedProvince = newValue.province;
				this.selectedCity = newValue.city;
				this.selectedDistrict = newValue.district;
				// this.updateMapCenter();
			}
		}
	},
	data() {
		return {
			showMap: false,
			map: null,
			marker: null,
			secretKey: 'FzmFz7gegFComdybMZ5EyTM0i6xRrieu',
			provinces: [],
			cities: [],
			districts: [],
			selectedProvince: '',
			selectedCity: '',
			selectedDistrict: ''
		};
	},
	mounted() {
	},
	created() {
		this.provinces = regionData;
	},
	methods: {
		showMapDialog() {
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
			if (this.areaInfo && this.areaInfo.province) {
				this.selectedProvince = TextToCode[this.areaInfo.province].code;
				this.handleProvinceChange(this.selectedProvince, false);
				if (this.areaInfo.city) {
					this.selectedCity = TextToCode[this.areaInfo.province][this.areaInfo.city].code;
					this.handleCityChange(this.selectedCity, false);
					if (this.areaInfo.district) {
						this.selectedDistrict = TextToCode[this.areaInfo.province][this.areaInfo.city][this.areaInfo.district].code;
						this.handleDistrictChange(this.selectedDistrict, false);
					}
				}
			}
			if (this.mapCenter && this.mapCenter.lat && this.mapCenter.lng) {
				this.updateMarker(center);
			}
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
						this.$emit('handleMapClick', {
							longitude: result.location.lng,
							latitude: result.location.lat,
							province: result.address_component.province,
							city: result.address_component.city,
							area: result.address_component.district,
							activityAddress: result.address
						});
						// Update selectedProvince, selectedCity, and selectedDistrict
						// this.selectedProvince = this.provinces.find(p => p.label === result.address_component.province)?.value || '';
						// this.handleProvinceChange();
						// this.selectedCity = this.cities.find(c => c.label === result.address_component.city)?.value || '';
						// this.handleCityChange();
						// this.selectedDistrict = this.districts.find(d => d.label === result.address_component.district)?.value || '';

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
		updateMapCenter() {
			let selectedArea = this.selectedDistrict || this.selectedCity || this.selectedProvince;
			if (!selectedArea) return;
			// 如果字符串长度小于6为则拼接0
			while (selectedArea.length < 6) {
				selectedArea = selectedArea + '0';
			}

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
		},
		handleProvinceChange(val, isUpdateCenter = true) {
			this.cities = this.provinces.find(item => item.value === val).children;
			this.selectedCity = '';
			this.selectedDistrict = '';
			if (isUpdateCenter) {
				this.updateMapCenter();
			}
		},
		handleCityChange(val, isUpdateCenter = true) {
			this.districts = this.cities.find(item => item.value === val).children;
			this.selectedDistrict = '';
			if (isUpdateCenter) {
				this.updateMapCenter();
			}
		},
		handleDistrictChange(val, isUpdateCenter = true) {
			if (isUpdateCenter) {
				this.updateMapCenter();
			}
		}
	}
};

</script>
<style lang="scss">
.map-controls {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
}

.map-controls .el-select {
	width: 30%;
}
</style>
