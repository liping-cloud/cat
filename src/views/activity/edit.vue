<template>
	<div class="activity-form">
		<el-form :model="form" :rules="rules" label-width="120px" ref="form">
			<el-form-item label="活动标题" prop="activityTitle">
				<el-input v-model="form.activityTitle" placeholder="请输入活动标题"></el-input>
			</el-form-item>

			<el-form-item label="活动时间" prop="dateRange">
				<el-date-picker v-model="form.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
			</el-form-item>

			<el-row :gutter="20">
				<el-col :span="8">
					<el-form-item label="商家名称" prop="activityCustomer">
						<el-input v-model="form.activityCustomer" placeholder="请输入商家名称"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="商家电话" prop="activityPhone">
						<el-input v-model="form.activityPhone" placeholder="请输入商家电话"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="商家地址" prop="activityAddress">
						<el-input v-model="form.activityAddress" placeholder="请输入商家地址" readonly>
							<el-button type="primary" slot="append" icon="el-icon-map-location" @click="openTencentMap">
								搜索
							</el-button>
						</el-input>
						<input type="hidden" v-model="form.longitude" />
						<input type="hidden" v-model="form.latitude" />
						<input type="hidden" v-model="form.province" />
						<input type="hidden" v-model="form.city" />
						<input type="hidden" v-model="form.area" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-form-item label="礼品份数" prop="giftTotal">
				<el-input-number v-model="form.giftTotal" :min="0" placeholder="请输入礼品分数"></el-input-number>
			</el-form-item>

			<el-form-item label="八字福卡" prop="chancesList">
				<el-row v-for="row in [0, 1]" :key="row">
					<el-col :span="6" v-for="col in [0, 1, 2, 3]" :key="col">
						<el-input style="width: 45%; margin-right: 5%" v-model="form.chancesList[row * 4 + col].cardName" :placeholder="`请输入文字${row * 4 + col + 1}`" class="mb-2"></el-input>
						<el-input-number style="width: 45%; margin-right: 5%" v-model="form.chancesList[row * 4 + col].quantity" :min="0" :max="100" :step="0.1" :placeholder="`请输入抽中概率`" class="w-full">
						</el-input-number>
					</el-col>
				</el-row>
			</el-form-item>

			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="首次抽奖机会" prop="firstChance">
						<el-input-number v-model="form.firstChance" :min="0" placeholder="请输入首次抽奖机会">
							<template slot="append">次</template>
						</el-input-number>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="邀请获得机会" prop="inviteChance">
						<el-input-number v-model="form.inviteChance" :min="0" placeholder="请输入邀请获得机会">
							<template slot="append">次</template>
						</el-input-number>
					</el-form-item>
				</el-col>
			</el-row>

			<el-form-item label="页面背景色值" prop="activityBg">
				<el-color-picker v-model="form.activityBg"></el-color-picker>
			</el-form-item>

			<el-row :gutter="20">
				<el-col :span="8">
					<el-form-item label="缩略图" prop="thumbnail">
						<ImageUpload ref="thumbnailImage" :limit="1" v-model="form.thumbnail" />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="微信封面图" prop="wXImg">
						<ImageUpload ref="wXImgImage" :limit="1" v-model="form.wXImg" />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="活动广告图" prop="activityBanner">
						<ImageUpload ref="activityBannerImage" :limit="1" v-model="form.activityBanner" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-form-item label="活动摘要" prop="wXSummary">
				<el-input type="textarea" v-model="form.wXSummary" placeholder="请输入活动摘要"></el-input>
			</el-form-item>

			<el-form-item label="活动规则" prop="activityRule">
				<Editor v-model="form.activityRule" :height="300" />
			</el-form-item>

			<el-form-item label="奖品信息" prop="activityContent">
				<Editor v-model="form.activityContent" :height="300" />
			</el-form-item>

			<el-form-item label="UV单价" prop="activityBaseCost">
				<el-input-number v-model="form.activityBaseCost" :min="0" :precision="2" placeholder="请输入UV单价"></el-input-number>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="onSubmit">保存</el-button>
				<el-button @click="onCancel">取消</el-button>
			</el-form-item>
		</el-form>
		<Map ref="map" @handleMapClick="handleMapClick" :area-info="areaInfo" :map-center="mapCenter" />
	</div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload/index.vue';
import Editor from '@/components/Editor/index.vue';
import Map from '@/components/Map/index.vue';
import { addActivity, getActivity, updateActivity } from '@/api/activity';

export default {
	components: {
		ImageUpload,
		Editor,
		Map
	},
	data() {
		return {
			form: {
				activityTitle: '',
				dateRange: [],
				activityCustomer: '',
				activityPhone: '',
				activityAddress: '',
				longitude: '',
				latitude: '',
				province: '',
				city: '',
				area: '',
				giftTotal: 0,
				chancesList: Array(8)
					.fill()
					.map(() => ({ cardName: '', quantity: 0 })),
				firstChance: 0,
				inviteChance: 0,
				activityBg: '',
				thumbnail: '',
				wXImg: '',
				activityBanner: '',
				wXSummary: '',
				activityRule: '',
				activityContent: '',
				activityBaseCost: 0
			},
			rules: {
				activityTitle: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
				dateRange: [{ type: 'array', required: true, message: '请选择活动时间', trigger: 'change' }],
				activityCustomer: [{ required: true, message: '请输入商家名称', trigger: 'blur' }],
				activityPhone: [{ required: true, message: '请输入商家电话', trigger: 'blur' }],
				activityAddress: [{ required: true, message: '请输入商家地址', trigger: 'blur' }],
				giftTotal: [{ required: true, message: '请输入礼品分数', trigger: 'blur' }],
				chancesList: [
					{
						type: 'array',
						required: true,
						message: '请填写八字福卡',
						trigger: 'blur',
						validator: (rule, value, callback) => {
							if (value.some(item => !item.cardName || item.quantity === null)) {
								callback(new Error('请填写完整的八字福卡信息'));
							} else {
								callback();
							}
						}
					}
				],
				firstChance: [{ required: true, message: '请输入首次抽奖机会', trigger: 'blur' }],
				inviteChance: [{ required: true, message: '请输入邀请获得机会', trigger: 'blur' }],
				activityBg: [{ required: true, message: '请选择页面背景色值', trigger: 'change' }],
				thumbnail: [{ required: true, message: '请上传缩略图', trigger: 'change' }],
				wXImg: [{ required: true, message: '请上传微信封面图', trigger: 'change' }],
				activityBanner: [{ required: true, message: '请上传活动广告图', trigger: 'change' }],
				wXSummary: [{ required: true, message: '请输入活动摘要', trigger: 'blur' }],
				activityRule: [{ required: true, message: '请输入活动规则', trigger: 'blur' }],
				activityContent: [{ required: true, message: '请输入奖品信息', trigger: 'blur' }],
				activityBaseCost: [{ required: true, message: '请输入UV单价', trigger: 'blur' }]
			},
			mapCenter: {
				lat: 39.90923,
				lng: 116.397428
			},
			areaInfo: {
				province: '',
				city: '',
				district: ''
			}
		};
	},
	mounted() {
	},
	created() {
		let id = this.$route.query.id;
		if (id) {
			getActivity(id).then(res => {
				this.form = res.data;
				this.form.dateRange = [new Date(res.data.startTime), new Date(res.data.endTime)];
				this.form.chancesList = res.data.chancesList.splice(0, 8)
				this.mapCenter = {
					lat: res.data.latitude,
					lng: res.data.longitude
				};
				this.areaInfo = {
					province: res.data.province,
					city: res.data.city,
					district: res.data.area
				};
			});
		}
	},
	methods: {
		handleMapClick(data) {
			for (let key in data) {
				this.form[key] = data[key];
			}
		},
		onSubmit() {
			if (this.$refs.thumbnailImage.fileList.length !== 0) {
				this.form.thumbnail = this.$refs.thumbnailImage.fileList[0].url;
			}
			if (this.$refs.wXImgImage.fileList.length !== 0) {
				this.form.wXImg = this.$refs.wXImgImage.fileList[0].url;
			}
			if (this.$refs.activityBannerImage.fileList.length !== 0) {
				this.form.activityBanner = this.$refs.activityBannerImage.fileList[0].url;
			}
			this.$refs.form.validate(valid => {
				if (valid) {
					let data = Object.assign({}, this.form);
					data['startTime'] = data.dateRange[0];
					data['endTime'] = data.dateRange[1];
					delete data.dateRange;
					// 格式化chancesList
					if (data.id) {
						updateActivity(data).then(res => {
							this.$message.success('活动更新成功');
							setTimeout(() => {
								this.$tab.closePage();
							}, 1000);
						});
					} else {
						addActivity(data).then(res => {
							this.$message.success('活动创建成功');
							setTimeout(() => {
								this.$tab.closePage();
							}, 1000);
						});
					}
				} else {
					return false;
				}
			});
		},
		onCancel() {
			this.$refs.form.resetFields();
		},
		openTencentMap() {
			this.$refs.map.showMapDialog();
		}
	}
};
</script>

<style scoped>
.activity-form {
	padding: 20px;
}

.mb-2 {
	margin-bottom: 8px;
}

.w-full {
	width: 100%;
}


</style>
