// دالة حفظ الجدول في التخزين المحلي
function saveSchedule(){
    localStorage.setItem('schedule', JSON.stringify(schedule));
}
// منطق التنقل بين التبويبات بشكل طبيعي
if (homeworkTab) {
    homeworkTab.addEventListener('click', ()=>{
        homeworkTab.classList.add('active');
        scheduleTab && scheduleTab.classList.remove('active');
        notificationTab && notificationTab.classList.remove('active');
        homeworkSection && homeworkSection.classList.remove('hidden');
        scheduleSection && scheduleSection.classList.add('hidden');
        notificationSection && notificationSection.classList.add('hidden');
    });
}
if (scheduleTab) {
    scheduleTab.addEventListener('click', ()=>{
        scheduleTab.classList.add('active');
        homeworkTab && homeworkTab.classList.remove('active');
        notificationTab && notificationTab.classList.remove('active');
        scheduleSection && scheduleSection.classList.remove('hidden');
        homeworkSection && homeworkSection.classList.add('hidden');
        notificationSection && notificationSection.classList.add('hidden');
    });
}
if (notificationTab) {
    notificationTab.addEventListener('click', ()=>{
        notificationTab.classList.add('active');
        homeworkTab && homeworkTab.classList.remove('active');
        scheduleTab && scheduleTab.classList.remove('active');
        notificationSection && notificationSection.classList.remove('hidden');
        homeworkSection && homeworkSection.classList.add('hidden');
        scheduleSection && scheduleSection.classList.add('hidden');
    });
}
// عند تحميل الصفحة، تفعيل الصفحة الرئيسية فقط أول مرة
if (homeworkTab) {
    homeworkTab.classList.add('active');
    scheduleTab && scheduleTab.classList.remove('active');
    notificationTab && notificationTab.classList.remove('active');
    homeworkSection && homeworkSection.classList.remove('hidden');
    scheduleSection && scheduleSection.classList.add('hidden');
    notificationSection && notificationSection.classList.add('hidden');
}
// دالة ترجع لون حسب اسم المادة
function getColorBySubject(subject){
    const colors = {
        'رياضيات': '#ff9800',
        'فيزياء': '#4caf50',
        'كيمياء': '#e91e63',
        'أحياء': '#2196f3',
        'لغة عربية': '#9c27b0',
        'لغة إنجليزية': '#3f51b5',
        'حاسوب': '#00bcd4',
        'تاريخ': '#795548',
        'جغرافيا': '#607d8b',
        'علوم': '#8bc34a',
        'دراسات': '#f44336',
        '': '#2575fc'
    };
    return colors[subject] || '#2575fc';
}
    // تعريف مصفوفة الجدول وتحميلها من التخزين المحلي
    let schedule = JSON.parse(localStorage.getItem('schedule')) || [];
document.addEventListener('DOMContentLoaded', () => {
    // تعريف دالة حذف الواجب القديم دائماً في النطاق العام
    window.confirmDeleteOldTask = function(index){
        let oldTasksLocal = JSON.parse(localStorage.getItem('oldTasks')) || [];
        const confirmDiv = document.getElementById('modernConfirm');
        if(!confirmDiv) return;
        confirmDiv.classList.add('show');
        confirmDiv.style.display = 'flex';
        // زر نعم
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        // إزالة أي أحداث سابقة
        if (yesBtn) yesBtn.onclick = null;
        if (noBtn) noBtn.onclick = null;
        if (yesBtn) yesBtn.onclick = function(){
            oldTasksLocal.splice(index,1);
            localStorage.setItem('oldTasks', JSON.stringify(oldTasksLocal));
            displayTasks();
            confirmDiv.classList.remove('show');
            setTimeout(()=>{confirmDiv.style.display='none';}, 400);
            showModernAlert("تم حذف الواجب القديم بنجاح!");
        };
        if (noBtn) noBtn.onclick = function(){
            confirmDiv.classList.remove('show');
            setTimeout(()=>{confirmDiv.style.display='none';}, 400);
        };
    }

    // تعريف المتغيرات أولاً
    let autoLectureNotifEnabled = localStorage.getItem('autoLectureNotifEnabled') === 'true';
    let autoLectureNotifTimerId = null;
    const enableAutoLectureNotifBtn = document.getElementById('enableAutoLectureNotifBtn');
    const disableAutoLectureNotifBtn = document.getElementById('disableAutoLectureNotifBtn');
    const autoLectureNotifStatus = document.querySelector('.auto-lecture-notif-status');

    // عند فتح التطبيق، ضبط حالة أزرار التفعيل/الإلغاء حسب حالة التذكير
    if (autoLectureNotifEnabled) {
        if (enableAutoLectureNotifBtn) enableAutoLectureNotifBtn.style.display = 'none';
        if (disableAutoLectureNotifBtn) disableAutoLectureNotifBtn.style.display = '';
        autoLectureNotifStatus.textContent = "إشعار التذكير مفعّل: سيتم تنبيهك قبل ساعة من أي محاضرة";
    } else {
        if (enableAutoLectureNotifBtn) enableAutoLectureNotifBtn.style.display = '';
        if (disableAutoLectureNotifBtn) disableAutoLectureNotifBtn.style.display = 'none';
        autoLectureNotifStatus.textContent = "إشعار التذكير غير مفعّل.";
    }

    function checkAndNotifyLectureBeforeHour() {
        if (!autoLectureNotifEnabled) return;
        if (!(window.Notification && Notification.permission === "granted")) return;
        const now = new Date();
        // احصل على اسم اليوم الحالي بالعربي
        const daysOrder = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
        const todayName = daysOrder[now.getDay()];
        // إشعار فقط مرتين في الساعة: عند الدقيقة 0 أو 30
        if (!(now.getMinutes() === 0 || now.getMinutes() === 30)) return;
        const lectures = schedule
            .filter(item => typeof item.time === 'string' && item.time.trim() !== '' && item.day === todayName)
            .map(item => {
                // تحويل وقت المحاضرة إلى تاريخ اليوم
                let [hourStr, minStr, ampm] = item.time.split(/:| /);
                let hour = parseInt(hourStr);
                let min = parseInt(minStr);
                if (ampm && ampm.toLowerCase() === "pm" && hour < 12) hour += 12;
                if (ampm && ampm.toLowerCase() === "am" && hour === 12) hour = 0;
                let lectureDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, min, 0, 0);
                return { ...item, lectureDate };
            });
        lectures.forEach(lec => {
            // إذا كان الوقت الحالي قبل المحاضرة بساعة ± 2 دقائق
            let diffMs = lec.lectureDate - now;
            let diffMin = Math.round(diffMs/60000);
            console.log(`محاضرة: ${lec.subject} | الوقت: ${lec.time} | فرق الدقائق: ${diffMin}`);
            if (diffMs >= 58*60*1000 && diffMs <= 62*60*1000) {
                // تحقق من عدم إرسال إشعار لنفس المحاضرة مرتين
                let notifKey = `notified_${lec.subject}_${lec.day}_${lec.time}_${now.toDateString()}`;
                if (!localStorage.getItem(notifKey)) {
                    // نافذة إشعار حديثة داخل التطبيق
                    let alertDiv = document.createElement('div');
                    alertDiv.className = 'modern-app-notif';
                    alertDiv.innerHTML = `
                        <div class="notif-icon"><img src="https://cdn-icons-png.flaticon.com/512/201/201818.png" style="width:32px;height:32px;"></div>
                        <div class="notif-content">
                            <strong style="color:#2575fc;font-size:1.08rem;">تذكير محاضرة بعد ساعة!</strong><br>
                            <span style="color:#222;font-weight:700;">${lec.subject}</span> | <span style="color:#2575fc;">${lec.day}</span> | <span style="color:#43ea7c;">${lec.time}</span>
                        </div>
                    `;
                    alertDiv.style.position = 'fixed';
                    alertDiv.style.top = '32px';
                    alertDiv.style.right = '32px';
                    alertDiv.style.background = 'linear-gradient(90deg,#fff 60%,#e3e6f3 100%)';
                    alertDiv.style.borderRadius = '18px';
                    alertDiv.style.boxShadow = '0 8px 32px rgba(37,117,252,0.13)';
                    alertDiv.style.padding = '18px 32px';
                    alertDiv.style.zIndex = '999999';
                    alertDiv.style.display = 'flex';
                    alertDiv.style.alignItems = 'center';
                    alertDiv.style.gap = '18px';
                    alertDiv.style.fontFamily = 'Cairo, Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
                    document.body.appendChild(alertDiv);
                    setTimeout(()=>{alertDiv.style.opacity='0';alertDiv.style.top='-100px';setTimeout(()=>{alertDiv.remove();},600);},3500);
                    localStorage.setItem(notifKey, "1");
                    console.log('تم إرسال إشعار التذكير لهذه المحاضرة');
                }
            } else {
                console.log('لم يتم إرسال إشعار لهذه المحاضرة، فرق الدقائق خارج النافذة المطلوبة');
            }
        });
    }

    function startAutoLectureNotif() {
    if (autoLectureNotifTimerId) clearInterval(autoLectureNotifTimerId);
    autoLectureNotifTimerId = setInterval(checkAndNotifyLectureBeforeHour, 1800000); // كل 30 دقيقة
    autoLectureNotifEnabled = true;
    localStorage.setItem('autoLectureNotifEnabled', 'true');
    autoLectureNotifStatus.textContent = "إشعار التذكير مفعّل: سيتم تنبيهك قبل ساعة من أي محاضرة";
    enableAutoLectureNotifBtn.style.display = 'none';
    disableAutoLectureNotifBtn.style.display = '';
    }
    function stopAutoLectureNotif() {
        if (autoLectureNotifTimerId) clearInterval(autoLectureNotifTimerId);
    autoLectureNotifEnabled = false;
    localStorage.setItem('autoLectureNotifEnabled', 'false');
    autoLectureNotifStatus.textContent = "إشعار التذكير غير مفعّل.";
    disableAutoLectureNotifBtn.style.display = 'none';
    enableAutoLectureNotifBtn.style.display = '';
    // عند فتح التطبيق، إذا كان التذكير مفعّل من قبل، فعّل النظام تلقائياً
    if (autoLectureNotifEnabled) {
        if (window.Notification && Notification.permission === "granted") {
            startAutoLectureNotif();
        } else if (window.Notification) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    startAutoLectureNotif();
                }
            });
        }
    }
    }
    if (enableAutoLectureNotifBtn && disableAutoLectureNotifBtn) {
        enableAutoLectureNotifBtn.onclick = function() {
            if (window.Notification) {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        startAutoLectureNotif();
                        showModernAlert("تم تفعيل إشعار التذكير قبل المحاضرة!");
                    } else {
                        showModernAlert("يجب السماح بالإشعارات من إعدادات المتصفح!");
                    }
                });
            } else {
                showModernAlert("المتصفح لا يدعم الإشعارات!");
            }
        };
        disableAutoLectureNotifBtn.onclick = function() {
            stopAutoLectureNotif();
            showModernAlert("تم إلغاء إشعار التذكير قبل المحاضرة!");
        };
    }
    // عند الضغط على أي مربع وقت يتم مسح القيمة تلقائياً
    ['notifIntervalHour', 'notifIntervalMin', 'notifIntervalSec'].forEach(id => {
        const el = document.getElementById(id);
        if (el && typeof el.addEventListener === 'function') {
            el.addEventListener('focus', function handler() {
                el.value = '';
                el.removeEventListener('focus', handler);
            });
        }
    });
    // فحص وجود أقسام التبويبات
    if (!document.getElementById('homeworkSection') || !document.getElementById('scheduleSection') || !document.getElementById('notificationSection')) {
        showModernAlert('هناك خطأ في تحميل أقسام الصفحة، تأكد من وجود جميع الأقسام في index.html');
        return;
    }
    // Flatpickr للوقت في الجدول
    if (window.flatpickr) {
        flatpickr("#scheduleTime", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "h:i K",
            time_24hr: false,
            minuteIncrement: 1,
            theme: "material_blue"
        });
    }
    // ================== DOM Elements ==================
    const addHomeworkBtn = document.getElementById('addHomeworkBtn');
    const tasksList = document.getElementById('tasksList');
    const oldTasksList = document.getElementById('oldTasksList');
    const toggleOldBtn = document.getElementById('toggleOldBtn');

    // دالة لحفظ المهام في التخزين المحلي
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    // تعريف مصفوفة المهام وتحميلها من التخزين المحلي
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainApp = document.getElementById('mainApp');
    const startBtn = document.getElementById('startBtn');

    const homeworkTab = document.getElementById('homeworkTab');
    const scheduleTab = document.getElementById('scheduleTab');
    const notificationTab = document.getElementById('notificationTab');

    const scheduleSection = document.getElementById('scheduleSection');
    const notificationSection = document.getElementById('notificationSection');

    const addScheduleBtn = document.getElementById('addScheduleBtn');
    const scheduleList = document.getElementById('scheduleList');

    const saveNotifBtn = document.getElementById('saveNotifBtn');
    const notifList = document.getElementById('notifList');

    const themeToggle = document.getElementById('themeToggle');

    let oldTasksVisible = false;

    function setupDropdown(wrapperId){
        const wrapper = document.getElementById(wrapperId);
        if(!wrapper) return;
        // زر حديث واختيارات حديثة
        const btn = wrapper.querySelector('.modern-select-btn, .custom-select-btn');
        const options = wrapper.querySelectorAll('.modern-option, .custom-option');

        btn.addEventListener('click', ()=>{
            wrapper.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', ()=>{
                // تحديث النص فقط للزر الحديث
                const selectText = btn.querySelector('.select-text');
                if(selectText){
                    selectText.textContent = option.textContent;
                    btn.dataset.value = option.getAttribute('data-value') || option.textContent;
                }else{
                    btn.textContent = option.textContent;
                    btn.dataset.value = option.getAttribute('data-value') || option.textContent;
                }
                wrapper.classList.remove('open');
            });
        });
    }

    // Setup all dropdowns
    setupDropdown('subjectSelectWrapper');
    setupDropdown('scheduleSelectWrapper');
    setupDropdown('scheduleDayWrapper');
    setupDropdown('daySelectWrapper');
    setupDropdown('hourSelectWrapper');
    setupDropdown('minuteSelectWrapper');
    setupDropdown('ampmSelectWrapper');
    setupDropdown('notifSelectWrapper');
    setupDropdown('notifHourWrapper');
    setupDropdown('notifMinuteWrapper');
    setupDropdown('notifAMPMWrapper');

    // Close dropdowns if clicked outside
    document.addEventListener('click', e=>{
        document.querySelectorAll('.custom-select-wrapper').forEach(wrapper=>{
            if(!wrapper.contains(e.target)){
                wrapper.classList.remove('open');
            }
        });
    });
// إشعار حديث أعلى الصفحة
function showModernAlert(msg){
    const alertDiv = document.getElementById('modernAlert');
    if(!alertDiv) return;
    alertDiv.textContent = msg;
    alertDiv.classList.add('show');
    alertDiv.style.display = 'block';
    setTimeout(()=>{
        alertDiv.classList.remove('show');
        setTimeout(()=>{alertDiv.style.display = 'none';}, 700);
    }, 3000);
}


    // ================== Tasks ==================
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth()+1).padStart(2,'0');
        const day = String(d.getDate()).padStart(2,'0');
        let hour = d.getHours();
        const min = String(d.getMinutes()).padStart(2,'0');
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        hour = String(hour).padStart(2,'0');
        return `${year}-${month}-${day} ${hour}:${min} ${ampm}`;
    }
    window.displayTasks = function(filter='all'){
        tasksList.innerHTML = '';
        oldTasksList.innerHTML = '';
        const today = new Date();
        // تحميل الواجبات القديمة من localStorage دائماً عند العرض
        let oldTasksLocal = JSON.parse(localStorage.getItem('oldTasks')) || [];
        // عرض الواجبات الحديثة فقط
        tasks.forEach((task,index)=>{
            const li = document.createElement('li');
            li.innerHTML = `<span style="font-weight:900;font-size:1.01rem;">${task.subject}</span>
                <span style="color:#2575fc;font-weight:700;margin:0 12px;">| ${task.homework}</span>
                <span style="color:#888;font-size:0.98rem;margin-left:8px;">${formatDate(task.date)}</span>
                <div>
                    <button class="copy-btn" style="background:none;border:none;color:#2575fc;font-size:1.15rem;margin-left:8px;" onclick="copyTask(${index})"><i class="fa fa-copy"></i></button>
                    <button class="delete-btn" style="background:none;border:none;color:#ff3c3c;font-size:1.15rem;" onclick="deleteTask(${index})"><i class="fa fa-trash"></i></button>
                </div>`;
            li.style.borderLeft = `8px solid ${getColorBySubject(task.subject)}`;
            li.style.borderRadius = "16px";
            li.style.background = "linear-gradient(90deg,#f7f7f7 60%,#e3e6f3 100%)";
            li.style.boxShadow = "0 4px 18px rgba(37,117,252,0.10)";
            li.style.marginBottom = "10px";
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.justifyContent = "space-between";
            tasksList.appendChild(li);
        });

        // عرض الواجبات القديمة فقط إذا كان oldTasksVisible
        if(oldTasksVisible){
            // إضافة عنوان واضح فوق قائمة الواجبات القديمة
            const oldTitle = document.createElement('li');
            oldTitle.textContent = 'الواجبات القديمة';
            oldTitle.style.textAlign = 'center';
            oldTitle.style.color = '#2575fc';
            oldTitle.style.fontWeight = 'bold';
            oldTitle.style.background = '#e3e6f3';
            oldTitle.style.borderRadius = '12px';
            oldTitle.style.padding = '12px';
            oldTasksList.appendChild(oldTitle);
            if(oldTasksLocal.length === 0){
                const msg = document.createElement('li');
                msg.style.textAlign = 'center';
                msg.style.color = '#888';
                msg.style.fontWeight = 'bold';
                msg.style.background = '#f7f7f7';
                msg.style.borderRadius = '12px';
                msg.style.padding = '16px';
                msg.textContent = 'ليس لديك واجبات قديمة';
                oldTasksList.appendChild(msg);
            }else{
                // زر حذف جماعي أعلى القائمة
                const bulkDeleteBtn = document.createElement('button');
                bulkDeleteBtn.textContent = '🗑️ حذف المحدد';
                bulkDeleteBtn.className = 'modern-btn';
                bulkDeleteBtn.style.margin = '12px auto 16px auto';
                bulkDeleteBtn.style.display = 'block';
                bulkDeleteBtn.onclick = function(){
                    let selected = Array.from(document.querySelectorAll('.old-task-checkbox:checked')).map(cb=>parseInt(cb.value));
                    if(selected.length === 0){
                        showModernAlert('حدد واجبات للحذف أولاً');
                        return;
                    }
                    // تأكيد الحذف الجماعي
                    const confirmDiv = document.getElementById('modernConfirm');
                    confirmDiv.querySelector('.modern-confirm-text').textContent = 'هل أنت متأكد من حذف الواجبات المحددة؟';
                    confirmDiv.classList.add('show');
                    confirmDiv.style.display = 'flex';
                    const yesBtn = document.getElementById('confirmYes');
                    const noBtn = document.getElementById('confirmNo');
                    yesBtn.onclick = function(){
                        // حذف من الأعلى للأدنى حتى لا تتغير الفهارس
                        selected.sort((a,b)=>b-a).forEach(idx=>oldTasksLocal.splice(idx,1));
                        localStorage.setItem('oldTasks', JSON.stringify(oldTasksLocal));
                        window.displayTasks();
                        confirmDiv.classList.remove('show');
                        setTimeout(()=>{confirmDiv.style.display='none';}, 400);
                        showModernAlert('تم حذف الواجبات المحددة بنجاح!');
                        confirmDiv.querySelector('.modern-confirm-text').textContent = 'هل أنت متأكد من حذف هذا الواجب القديم؟';
                    };
                    noBtn.onclick = function(){
                        confirmDiv.classList.remove('show');
                        setTimeout(()=>{confirmDiv.style.display='none';}, 400);
                        confirmDiv.querySelector('.modern-confirm-text').textContent = 'هل أنت متأكد من حذف هذا الواجب القديم؟';
                    };
                };
                oldTasksList.appendChild(bulkDeleteBtn);
                // عرض الواجبات القديمة مع CheckBox
                oldTasksLocal.forEach((task,index)=>{
                    const li = document.createElement('li');
                    li.innerHTML = `<input type="checkbox" class="old-task-checkbox" value="${index}">
                        <span style="font-weight:900;font-size:1.01rem;">${task.subject}</span>
                        <span style="color:#2575fc;font-weight:700;margin:0 12px;">| ${task.homework}</span>
                        <span style="color:#888;font-size:0.98rem;margin-left:8px;">${formatDate(task.date)}</span>
                        <button class="delete-btn" style="background:none;border:none;color:#ff3c3c;font-size:1.15rem;" onclick="confirmDeleteOldTask(${index})"><i class="fa fa-trash"></i></button>`;
                    li.style.borderLeft = `8px solid ${getColorBySubject(task.subject)}`;
                    li.style.borderRadius = "16px";
                    li.style.background = "linear-gradient(90deg,#f7f7f7 60%,#e3e6f3 100%)";
                    li.style.boxShadow = "0 4px 18px rgba(37,117,252,0.10)";
                    li.style.marginBottom = "10px";
                    li.style.display = "flex";
                    li.style.alignItems = "center";
                    li.style.justifyContent = "space-between";
                    oldTasksList.appendChild(li);
                });
            }
            oldTasksList.style.display = 'block';
        }else{
            oldTasksList.style.display = 'none';
        }
    }

    window.copyTask = function(index){
        const task = tasks[index];
        navigator.clipboard.writeText(`${task.subject}: ${task.homework}`)
            .then(()=> showModernAlert("!تم النسخ"))
            .catch(()=> showModernAlert("!فشل النسخ"));
    }

    window.deleteTask = function(index){
    // تحميل الواجبات القديمة من localStorage
    let oldTasksLocal = JSON.parse(localStorage.getItem('oldTasks')) || [];
    if (tasks[index]) {
        // نسخ بيانات الواجب قبل الحذف
        const deletedTask = {...tasks[index]};
        oldTasksLocal.push(deletedTask);
        localStorage.setItem('oldTasks', JSON.stringify(oldTasksLocal));
        console.log('تمت إضافة الواجب إلى oldTasks:', deletedTask);
    // تم حذف رسالة التنبيه التي تظهر بيانات oldTasks بعد الحذف
    } else {
        console.log('لم يتم العثور على الواجب للحذف');
    }
    tasks.splice(index,1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
}

    if (toggleOldBtn && typeof toggleOldBtn.addEventListener === 'function') {
        toggleOldBtn.addEventListener('click', ()=>{
            oldTasksVisible = !oldTasksVisible;
            displayTasks();
            const toggleText = document.getElementById('toggleOldText');
            if(toggleText){
                toggleText.textContent = oldTasksVisible ? 'إخفاء الواجبات القديمة' : 'إظهار الواجبات القديمة';
            }
            // حذف واجب قديم مع تأكيد حديث
            window.confirmDeleteOldTask = function(index){
                // تحميل الواجبات القديمة من localStorage
                let oldTasksLocal = JSON.parse(localStorage.getItem('oldTasks')) || [];
                const confirmDiv = document.getElementById('modernConfirm');
                if(!confirmDiv) return;
                confirmDiv.classList.add('show');
                confirmDiv.style.display = 'flex';
                // زر نعم
                const yesBtn = document.getElementById('confirmYes');
                const noBtn = document.getElementById('confirmNo');
                // إزالة أي أحداث سابقة
                if (yesBtn) yesBtn.onclick = null;
                if (noBtn) noBtn.onclick = null;
                if (yesBtn) yesBtn.onclick = function(){
                    oldTasksLocal.splice(index,1);
                    localStorage.setItem('oldTasks', JSON.stringify(oldTasksLocal));
                    displayTasks();
                    confirmDiv.classList.remove('show');
                    setTimeout(()=>{confirmDiv.style.display='none';}, 400);
                    showModernAlert("تم حذف الواجب القديم بنجاح!");
                };
                if (noBtn) noBtn.onclick = function(){
                    confirmDiv.classList.remove('show');
                    setTimeout(()=>{confirmDiv.style.display='none';}, 400);
                };
            }
        });
    }

    addHomeworkBtn.addEventListener('click', ()=>{
        const wrapper = document.getElementById('subjectSelectWrapper');
        const subjBtn = wrapper ? wrapper.querySelector('.custom-select-btn') : null;
        let subj = '';
        if(subjBtn && subjBtn.dataset && subjBtn.dataset.value){
            subj = subjBtn.dataset.value.trim();
        } else if(subjBtn) {
            subj = subjBtn.textContent.trim();
        }
        const hwInput = document.getElementById('homeworkInput');
        const hw = hwInput ? hwInput.value.trim() : '';
        // تحقق صارم من اختيار المادة
        if(subj === '' || subj === 'اختر المادة' || !hw){
            if(hwInput) hwInput.classList.add('input-error');
            showModernAlert("الرجاء اختيار المادة وكتابة الواجب بشكل صحيح");
            setTimeout(()=>{if(hwInput) hwInput.classList.remove('input-error');}, 1200);
            return;
        }
        tasks.push({subject:subj, homework:hw, date:new Date().toISOString()});
        saveTasks(); displayTasks();
        showModernAlert("تم إضافة الواجب بنجاح!");
        if(subjBtn) subjBtn.textContent = "اختر المادة";
        if(subjBtn && subjBtn.dataset) subjBtn.dataset.value = "اختر المادة";
        if(hwInput) hwInput.value = "";
    });

    // ================== Schedule ==================
    if (addScheduleBtn && typeof addScheduleBtn.addEventListener === 'function') {
        addScheduleBtn.addEventListener('click', ()=>{
            // دعم الكلاسات الحديثة للزر
            const subjWrapper = document.getElementById('scheduleSelectWrapper');
            const dayWrapper = document.getElementById('scheduleDayWrapper');
            const subjBtn = subjWrapper ? subjWrapper.querySelector('.modern-select-btn, .custom-select-btn') : null;
            const dayBtn = dayWrapper ? dayWrapper.querySelector('.modern-select-btn, .custom-select-btn') : null;
            const subj = subjBtn && subjBtn.dataset.value ? subjBtn.dataset.value.trim() : '';
            const day = dayBtn && dayBtn.dataset.value ? dayBtn.dataset.value.trim() : '';
            const timeInput = document.getElementById('scheduleTime');
            const time = timeInput ? timeInput.value : '';
            if(!subj || subj==="اختر المادة" || !time || !day || day==="اختر اليوم"){
                showModernAlert("الرجاء اختيار المادة والوقت واليوم");
                return;
            }
            schedule.push({subject:subj, time, day});
            saveSchedule(); displaySchedule();
            // نافذة منبثقة خضراء باسم المادة واليوم والوقت
            showModernAlert(`تمت إضافة المحاضرة بنجاح!\nالمادة: ${subj}\nاليوم: ${day}\nالوقت: ${time}`);
            if(subjBtn && subjBtn.querySelector('.select-text')) {
                subjBtn.querySelector('.select-text').textContent = "اختر المادة";
                subjBtn.dataset.value = "اختر المادة";
            }
            if(dayBtn && dayBtn.querySelector('.select-text')) {
                dayBtn.querySelector('.select-text').textContent = "اختر اليوم";
                dayBtn.dataset.value = "اختر اليوم";
            }
            if(timeInput) timeInput.value = "";
        });
    }
    function displaySchedule(){
        scheduleList.innerHTML='';
        const daysOrder=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
        // تجميع المحاضرات حسب اليوم
        const grouped = {};
        schedule.forEach((item,index)=>{
            if(!grouped[item.day]) grouped[item.day]=[];
            grouped[item.day].push({...item, index});
        });
        daysOrder.forEach(day=>{
            if(grouped[day]){
                // عنوان اليوم بشكل حديث وجذاب
                const dayHeader = document.createElement('li');
                dayHeader.innerHTML = `<strong style="color:#fff;font-size:1.25rem;letter-spacing:1px;">${day}</strong>`;
                dayHeader.style.background = "linear-gradient(90deg,#6a11cb 0%,#2575fc 100%)";
                dayHeader.style.borderRadius = "16px";
                dayHeader.style.margin = "18px 0 8px 0";
                dayHeader.style.padding = "14px 0";
                dayHeader.style.boxShadow = "0 4px 18px rgba(37,117,252,0.13)";
                scheduleList.appendChild(dayHeader);
                grouped[day].forEach(item=>{
                    const li = document.createElement('li');
                    li.innerHTML = `<span style="font-weight:900;font-size:1.12rem;">${item.subject}</span>
                        <span style="color:#2575fc;font-weight:700;margin:0 12px;">| الساعة ${item.time}</span>
                        <button class=\"delete-btn\" style=\"background:none;border:none;color:#ff3c3c;font-size:1.2rem;\" onclick=\"deleteSchedule(${item.index})\"><i class=\"fa fa-trash\"></i></button>`;
                    li.style.borderLeft = `8px solid ${getColorBySubject(item.subject)}`;
                    li.style.borderRadius = "16px";
                    li.style.background = "linear-gradient(90deg,#f7f7f7 60%,#e3e6f3 100%)";
                    li.style.boxShadow = "0 4px 18px rgba(37,117,252,0.10)";
                    li.style.marginBottom = "10px";
                    li.style.display = "flex";
                    li.style.alignItems = "center";
                    li.style.justifyContent = "space-between";
                    scheduleList.appendChild(li);
                });
            }
        });
    }
    window.deleteSchedule = function(index){ schedule.splice(index,1); saveSchedule(); displaySchedule(); showModernAlert("تم حذف المحاضرة بنجاح!"); }

    // ================== Notifications ==================

    // ================== نظام الإشعارات الجديد ==================
    let notifIntervalId = null;
    let notifIntervalMs = parseInt(localStorage.getItem('notifIntervalMs')) || 30000;
    let notifEnabled = localStorage.getItem('notifEnabled') === 'true';

    const enableNotifBtn = document.getElementById('enableNotifBtn');
    const disableNotifBtn = document.getElementById('disableNotifBtn');
    const notifIntervalMinInput = document.getElementById('notifIntervalMin');
    const notifIntervalSecInput = document.getElementById('notifIntervalSec');
    const notifIntervalHourInput = document.getElementById('notifIntervalHour');
    const notifStatus = document.querySelector('.notif-status');

    function updateNotifButtons() {
        notifEnabled = localStorage.getItem('notifEnabled') === 'true';
        notifIntervalMs = parseInt(localStorage.getItem('notifIntervalMs')) || 30000;
        if (notifEnabled && localStorage.getItem('notifIntervalMs')) {
            if (enableNotifBtn) { enableNotifBtn.style.display = 'none'; enableNotifBtn.disabled = true; }
            if (disableNotifBtn) { disableNotifBtn.style.display = ''; disableNotifBtn.disabled = false; }
            notifStatus.textContent = "الإشعارات مفعلة كل " +
                (Math.floor(notifIntervalMs/3600000) > 0 ? Math.floor(notifIntervalMs/3600000) + " ساعة " : "") +
                (Math.floor((notifIntervalMs%3600000)/60000) > 0 ? Math.floor((notifIntervalMs%3600000)/60000) + " دقيقة " : "") +
                (Math.floor((notifIntervalMs%60000)/1000) > 0 ? Math.floor((notifIntervalMs%60000)/1000) + " ثانية " : "");
        } else {
            if (enableNotifBtn) { enableNotifBtn.style.display = ''; enableNotifBtn.disabled = false; }
            if (disableNotifBtn) { disableNotifBtn.style.display = 'none'; disableNotifBtn.disabled = true; }
            notifStatus.textContent = "الإشعارات غير مفعلة.";
        }
    }

    // عند بداية التطبيق
    updateNotifButtons();
    // تحديث حالة زر الإشعارات دائماً عند بداية التطبيق
    updateNotifButtons();
    // تحديث حالة الزر عند التنقل بين جميع التبويبات
    [homeworkTab, scheduleTab, notificationTab].forEach(tab => {
        if (tab) tab.addEventListener('click', updateNotifButtons);
    });
    function getTodayLectures() {
        const today = new Date();
        const daysOrder = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
        // اليوم الحالي حسب ترتيب أيام الأسبوع العربي
        const todayName = daysOrder[today.getDay()];
        return schedule.filter(item => item.day === todayName);
    }

    function cleanSubjectName(str) {
        // إزالة الرموز والسمايلات والمسافات الزائدة
        return str.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g,"").replace(/\s+/g,"");
    }

    function getLectureHomework(subject) {
        // ابحث عن واجب للمادة اليوم
        const today = new Date();
        function isSameDay(date1, date2) {
            return date1.getFullYear() === date2.getFullYear() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getDate() === date2.getDate();
        }
        let subjectClean = cleanSubjectName(subject);
        let todaysTasks = tasks.filter(task => {
            let taskDate = new Date(task.date);
            let taskSubjectClean = cleanSubjectName(task.subject);
            return taskSubjectClean === subjectClean && isSameDay(taskDate, today);
        });
        if (todaysTasks.length > 0) {
            // خذ آخر واجب تم إدخاله
            return todaysTasks[todaysTasks.length - 1];
        }
        return null;
    }

    function sendLectureNotification() {
        const lectures = getTodayLectures();
        if (lectures.length === 0) {
            showModernAlert("لا توجد محاضرات اليوم لجدولك!");
            return;
        }
        lectures.forEach(lec => {
            // استخراج اسم المادة النقي
            let subjectClean = cleanSubjectName(lec.subject);
            let homeworkObj = getLectureHomework(subjectClean);
            let homeworkText = homeworkObj && homeworkObj.homework ? homeworkObj.homework : "لا توجد واجبات";
            let timeText = lec.time ? lec.time : "غير محدد";
            let dayText = lec.day ? lec.day : "اليوم غير محدد";
            console.log('إشعار:', {day: dayText, subject: subjectClean, time: timeText, homework: homeworkText});
            // نافذة إشعار حديثة داخل التطبيق
            let alertDiv = document.createElement('div');
            alertDiv.className = 'modern-app-notif';
            alertDiv.innerHTML = `
                <div class="notif-icon"><img src="https://cdn-icons-png.flaticon.com/512/201/201818.png" style="width:32px;height:32px;"></div>
                <div class="notif-content">
                    <strong style="color:#2575fc;font-size:1.08rem;">لديك محاضرة اليوم!</strong><br>
                    <span style="color:#222;font-weight:700;">${subjectClean}</span> | <span style="color:#2575fc;">${dayText}</span> | <span style="color:#43ea7c;">${timeText}</span><br>
                    <span style="color:#888;font-size:0.98rem;">${homeworkText}</span>
                </div>
            `;
            alertDiv.style.position = 'fixed';
            alertDiv.style.top = '32px';
            alertDiv.style.right = '32px';
            alertDiv.style.background = 'linear-gradient(90deg,#fff 60%,#e3e6f3 100%)';
            alertDiv.style.borderRadius = '18px';
            alertDiv.style.boxShadow = '0 8px 32px rgba(37,117,252,0.13)';
            alertDiv.style.padding = '18px 32px';
            alertDiv.style.zIndex = '999999';
            alertDiv.style.display = 'flex';
            alertDiv.style.alignItems = 'center';
            alertDiv.style.gap = '18px';
            alertDiv.style.fontFamily = 'Cairo, Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
            document.body.appendChild(alertDiv);
            setTimeout(()=>{alertDiv.style.opacity='0';alertDiv.style.top='-100px';setTimeout(()=>{alertDiv.remove();},600);},3500);
        });
    }

    function startNotificationInterval() {
        if (notifIntervalId) clearInterval(notifIntervalId);
        notifIntervalId = setInterval(sendLectureNotification, notifIntervalMs);
        // حساب الوقت كنص
        let hour = Math.floor(notifIntervalMs/3600000);
        let min = Math.floor((notifIntervalMs%3600000)/60000);
        let sec = Math.floor((notifIntervalMs%60000)/1000);
        let txt = "الإشعارات مفعلة كل ";
        if(hour>0) txt += `${hour} ساعة`;
        if(min>0) txt += (hour>0?" و ":"") + `${min} دقيقة`;
        if(sec>0) txt += ((hour>0||min>0)?" و ":"") + `${sec} ثانية`;
        notifStatus.textContent = txt;
    }

    function stopNotificationInterval() {
        if (notifIntervalId) clearInterval(notifIntervalId);
        notifStatus.textContent = "الإشعارات غير مفعلة.";
    }

    if (enableNotifBtn && disableNotifBtn && notifIntervalMinInput && notifIntervalSecInput && notifIntervalHourInput) {
        enableNotifBtn.onclick = function() {
            let hour = parseInt(notifIntervalHourInput.value) || 0;
            let min = parseInt(notifIntervalMinInput.value) || 0;
            let sec = parseInt(notifIntervalSecInput.value) || 0;
            let notifIntervalMs = (hour*3600 + min*60 + sec)*1000;
            if (hour === 0 && min === 0 && sec === 0) {
                showModernAlert("يرجى تحديد وقت للإشعار (ساعة أو دقيقة أو ثانية)");
                return;
            }
            if (notifIntervalMs < 30000) {
                showModernAlert("!أقل وقت مسموح لتكرار الإشعار هو 30 ثانية ");
                return;
            }
            localStorage.setItem('notifIntervalMs', notifIntervalMs);
            localStorage.setItem('notifEnabled', 'true');
            notifEnabled = true;
            if (window.Notification) {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        startNotificationInterval();
                        showModernAlert("تم تفعيل الإشعارات!");
                        updateNotifButtons();
                    } else {
                        showModernAlert("يجب السماح بالإشعارات من إعدادات المتصفح!");
                    }
                });
            } else {
                showModernAlert("المتصفح لا يدعم الإشعارات!");
            }
        };
        disableNotifBtn.onclick = function() {
            stopNotificationInterval();
            showModernAlert("تم إلغاء الإشعارات!");
            disableNotifBtn.style.display = 'none';
            enableNotifBtn.style.display = '';
            localStorage.removeItem('notifIntervalMs');
            localStorage.setItem('notifEnabled', 'false');
            notifEnabled = false;
            updateNotifButtons();
        };
    }
    // ================== Tabs ==================
    if (homeworkTab) {
        homeworkTab.addEventListener('click', ()=>{
            homeworkTab.classList.add('active');
            scheduleTab && scheduleTab.classList.remove('active');
            notificationTab && notificationTab.classList.remove('active');
            homeworkSection && homeworkSection.classList.remove('hidden');
            scheduleSection && scheduleSection.classList.add('hidden');
            notificationSection && notificationSection.classList.add('hidden');
        });
    }
    if (scheduleTab) {
        scheduleTab.addEventListener('click', ()=>{
            scheduleTab.classList.add('active');
            homeworkTab && homeworkTab.classList.remove('active');
            notificationTab && notificationTab.classList.remove('active');
            scheduleSection && scheduleSection.classList.remove('hidden');
            homeworkSection && homeworkSection.classList.add('hidden');
            notificationSection && notificationSection.classList.add('hidden');
            // إظهار الجدول مباشرة
            document.getElementById('addScheduleSettingsWrapper') && (document.getElementById('addScheduleSettingsWrapper').style.display = 'none');
            document.getElementById('scheduleList') && (document.getElementById('scheduleList').style.display = '');
        });
    }
    if (notificationTab) {
        notificationTab.addEventListener('click', ()=>{
            notificationTab.classList.add('active');
            homeworkTab && homeworkTab.classList.remove('active');
            scheduleTab && scheduleTab.classList.remove('active');
            notificationSection && notificationSection.classList.remove('hidden');
            homeworkSection && homeworkSection.classList.add('hidden');
            scheduleSection && scheduleSection.classList.add('hidden');
        });
    }
    // ...تم حذف الكود الذي يجبر زر الإلغاء على الاختفاء عند فتح تبويب الإشعارات...

    // ================== Theme ==================

    // ================== Initialize ==================
    displayTasks();
    displaySchedule();
    const showAddScheduleSettingsBtn = document.getElementById('showAddScheduleSettingsBtn');
    if(showAddScheduleSettingsBtn){
        showAddScheduleSettingsBtn.onclick = function(){
            const addSettings = document.getElementById('addScheduleSettingsWrapper');
            const scheduleList = document.getElementById('scheduleList');
            if(addSettings.style.display === '' || addSettings.style.display === 'block'){
                // إذا كانت الإعدادات ظاهرة، نرجع للجدول
                addSettings.style.display = 'none';
                scheduleList.style.display = '';
                showAddScheduleSettingsBtn.textContent = 'إضافة جدول';
            }else{
                // إذا كانت الإعدادات مخفية، نظهرها
                addSettings.style.display = '';
                scheduleList.style.display = 'none';
                showAddScheduleSettingsBtn.textContent = 'رجوع';
            }
        };
    }
    const showOldTasksBtn = document.getElementById('showOldTasksBtn');
const showOldTasksText = document.getElementById('showOldTasksText');
if(showOldTasksBtn && showOldTasksText){
    showOldTasksBtn.onclick = function(){
        oldTasksVisible = !oldTasksVisible;
        displayTasks();
        showOldTasksText.textContent = oldTasksVisible ? 'رجوع' : 'الواجبات القديمة';
        // إظهار أو إخفاء باقي عناصر قسم الواجبات حسب الحالة
        Array.from(homeworkSection.children).forEach(child => {
            if(child !== oldTasksList && child.id !== 'showOldTasksBtn')
                child.style.display = oldTasksVisible ? 'none' : '';
        });
        oldTasksList.style.display = oldTasksVisible ? 'block' : 'none';
    };
}
});
