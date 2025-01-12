<template>
	<div class="app-container">
		<el-form ref="form" :model="form" :rules="rules" :inline="true" label-width="120px">
			<div>
				<el-form-item label="毛利润率" prop="baseProfit">
					<el-input v-model="form.baseProfit">
						<template slot="append">%</template>
					</el-input>
				</el-form-item>
			</div>
			<div>
				<el-form-item label="阅读量单价" prop="baseCost">
					<el-input v-model="form.baseCost"></el-input>
				</el-form-item>
			</div>
			<div>
				<el-form-item label="推荐奖励" prop="areaReward">
					<el-input v-model="form.areaReward">
						<template slot="append">%</template>
					</el-input>
				</el-form-item>
			</div>
			<div>
				<el-form-item label="异地折扣率" prop="introduceReward">
					<el-input v-model="form.introduceReward">
						<template slot="append">%</template>
					</el-input>
				</el-form-item>
			</div>
		</el-form>
		<el-button type="primary" @click="submitForm('form')">提交</el-button>
	</div>
</template>
<script>
import { getBaseSetting, setBaseSetting } from '@/api/system/withdrawal';

export default {
	data() {
		return {
			form: {
				baseProfit: 0,
				baseCost: 0,
				areaReward: 0,
				introduceReward: 0
			},
			rules: {
				baseProfit: [
					{ required: true, message: '请输入毛利润率', trigger: 'blur' },
					{ pattern: /^[0-9]+(.[0-9]{1,2})?$/, message: '请输入数值，最多保留两位小数' }
				],
				baseCost: [
					{ required: true, message: '请输入阅读量单价', trigger: 'blur' },
					{ pattern: /^[0-9]+(.[0-9]{1,2})?$/, message: '请输入数值，最多保留两位小数' }
				],
				areaReward: [
					{ required: true, message: '请输入推荐奖励', trigger: 'blur' },
					{ pattern: /^[0-9]+(.[0-9]{1,2})?$/, message: '请输入数值，最多保留两位小数' }
				],
				introduceReward: [
					{ required: true, message: '请输入异地折扣率', trigger: 'blur' },
					{ pattern: /^[0-9]+(.[0-9]{1,2})?$/, message: '请输入数值，最多保留两位小数' }
				]
			}
		};
	},
	mounted() {
		getBaseSetting().then(res => {
			this.form = res;
		});
	},
	methods: {
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (valid) {
					setBaseSetting({
						...this.form
					}).then(res => {
						this.$message.success('设置成功');
					});
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		}
	}
};
</script>
<style lang="scss"></style>
