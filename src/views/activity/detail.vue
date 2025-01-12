<template>
	<div class="activity-details">
		<el-card class="detail-card">
			<!-- 基本信息部分 -->
			<el-row class="detail-item">
				<el-col :span="4" class="label">活动标题</el-col>
				<el-col :span="20">XXXXXXXXXXXXXXXXXX</el-col>
			</el-row>

			<el-row class="detail-item">
				<el-col :span="4" class="label">活动时间</el-col>
				<el-col :span="20">2024-12-26 至 2025-01-26</el-col>
			</el-row>

			<el-row :gutter="20" class="detail-item">
				<el-col :span="8">
					<span class="label">商家名称：</span>
					<span>XXXXXXXXX</span>
				</el-col>
				<el-col :span="8">
					<span class="label">商家电话：</span>
					<span>13777433171</span>
				</el-col>
				<el-col :span="8">
					<span class="label">商家地址：</span>
					<span>XXXXXXXXXXXXXXXXXX</span>
				</el-col>
			</el-row>

			<!-- 统计数据 -->
			<el-row :gutter="20" class="statistics">
				<el-col :span="6">
					<div class="stat-item">
						<div class="stat-label">礼品份数</div>
						<div class="stat-value">30份</div>
					</div>
				</el-col>
				<el-col :span="6">
					<div class="stat-item">
						<div class="stat-label">已中奖</div>
						<div class="stat-value">12份</div>
					</div>
				</el-col>
				<el-col :span="4">
					<div class="stat-item">
						<div class="stat-label">当前访问次数</div>
						<div class="stat-value">16523次</div>
					</div>
				</el-col>
				<el-col :span="4">
					<div class="stat-item">
						<div class="stat-label">当前访问人数</div>
						<div class="stat-value">16523人</div>
					</div>
				</el-col>
				<el-col :span="4">
					<div class="stat-item">
						<div class="stat-label">参与人数</div>
						<div class="stat-value">16521人</div>
					</div>
				</el-col>
			</el-row>

			<!-- 八字福卡 -->
			<div class="fortune-cards">
				<el-row :gutter="20">
					<el-col :span="3" v-for="(card, index) in fortuneCards" :key="index">
						<div class="fortune-card">
							<div class="card-character">{{ card.character }}</div>
							<div class="card-probability">({{ card.probability }}%)</div>
						</div>
					</el-col>
				</el-row>
			</div>

			<!-- 奖品领取记录 -->
			<div class="record-section">
				<div class="section-header">奖品领取记录</div>
				<el-table
					:data="recordData"
					style="width: 100%"
					border stripe
					:header-cell-style="{
            background: '#F5F7FA',
            color: '#606266',
            fontWeight: '500'
          }"
				>
					<el-table-column
						prop="code"
						label="核销码"
						align="center"
						min-width="150">
					</el-table-column>
					<el-table-column
						prop="date"
						label="核销日期"
						align="center"
						min-width="180">
					</el-table-column>
					<el-table-column
						prop="user"
						label="核销用户"
						align="center"
						min-width="150">
					</el-table-column>
					<el-table-column
						prop="phone"
						label="核销用户号码"
						align="center"
						min-width="150">
					</el-table-column>
				</el-table>
			</div>
		</el-card>
	</div>
</template>

<script>
export default {
	name: 'ActivityDetails',
	data() {
		return {
			fortuneCards: [
				{ character: '福', probability: 15 },
				{ character: '运', probability: 15 },
				{ character: '腾', probability: 15 },
				{ character: '腾', probability: 15 },
				{ character: '财', probability: 15 },
				{ character: '源', probability: 15 },
				{ character: '滚', probability: 15 },
				{ character: '滚', probability: 15 }
			],
			recordData: [{
				code: 'KSFL323421',
				date: '2025-01-23 14:32:33',
				user: '热情上的骆驼',
				phone: '13777433171'
			}]
		}
	}
}
</script>

<style scoped>
.activity-details {
	padding: 20px;
	background-color: #f5f7fa;
	min-height: 100vh;
}

.detail-card {
	margin-bottom: 20px;
}

.detail-item {
	margin-bottom: 20px;
	line-height: 1.5;
}

.label {
	color: #606266;
	font-weight: 500;
}

.statistics {
	margin: 30px 0;
}

.stat-item {
	text-align: center;
	padding: 15px;
	background-color: #f8f9fa;
	border-radius: 4px;
}

.stat-label {
	color: #606266;
	font-size: 14px;
	margin-bottom: 8px;
}

.stat-value {
	color: #303133;
	font-size: 20px;
	font-weight: bold;
}

.fortune-cards {
	margin: 30px 0;
}

.fortune-card {
	background: linear-gradient(135deg, #ff4e50, #f9d423);
	color: white;
	padding: 15px;
	border-radius: 8px;
	text-align: center;
	height: 80px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.card-character {
	font-size: 24px;
	font-weight: bold;
	margin-bottom: 5px;
}

.card-probability {
	font-size: 12px;
	opacity: 0.8;
}

.record-section {
	margin-top: 30px;
}

.section-header {
	font-size: 16px;
	color: #303133;
	font-weight: 500;
	margin-bottom: 20px;
}

/* Element UI 表格样式覆盖 */
.el-table {
	margin-top: 15px;
}

.el-table th {
	background-color: #f5f7fa !important;
}

.el-table td, .el-table th {
	padding: 12px 0;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
	background-color: #f5f7fa;
}
</style>
