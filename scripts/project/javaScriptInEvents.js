

const scriptsInEvents = {

	async 事件表2_Event2(runtime, localVars)
	{
		// 初始化 Firebase（只會執行一次）
		await window.InitFirebase();
		// 啟動監聽 RTDB
		window._rt_unsub = await window.RT_ListenValueWithDiff("controllers/main", (info) => {
		    const data = info.fullData;
		
		    runtime.globalVars.stage = data.stage;
		    runtime.globalVars.chose = data.chose;
		    runtime.globalVars.minu   = data.minu;
		    runtime.globalVars.hour  = data.hour;
		});
		
	},

	async 事件表2_Event11(runtime, localVars)
	{
		await window.RT_UpdateField(
		    "controllers/main",        // 路徑
		    "hour",                   // 欄位名稱
		    runtime.globalVars.hour   // 新值
		);
	},

	async 事件表2_Event16(runtime, localVars)
	{
		await window.RT_UpdateField(
		    "controllers/main",        // 路徑
		    "minu",                   // 欄位名稱
		    runtime.globalVars.minu   // 新值
		);
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
