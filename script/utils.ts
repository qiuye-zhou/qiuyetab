import process from 'node:process'

// 获取端口号，优先使用环境变量 PORT
export const port = Number(process.env.PORT || '') || 2233