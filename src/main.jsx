import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, CalendarDays, CheckSquare, Utensils, Clock3, Plus, Trash2 } from 'lucide-react';
import './style.css';

const today = new Date();
const yyyyMmDd = today.toISOString().slice(0, 10);
const weekdays = ['월', '화', '수', '목', '금'];

const defaultTimetable = {
  월: ['국어', '수학', '영어', '과학', '체육', '도덕'],
  화: ['수학', '사회', '국어', '미술', '영어', '창체'],
  수: ['영어', '과학', '수학', '음악', '국어', '기술'],
  목: ['사회', '영어', '체육', '수학', '국어', '과학'],
  금: ['국어', '진로', '수학', '영어', '스포츠', '동아리'],
};

const sampleMeals = {
  today: ['현미밥', '미역국', '돈육불고기', '계란말이', '배추김치', '요구르트'],
  tomorrow: ['카레라이스', '유부장국', '치킨텐더', '과일샐러드', '깍두기']
};

function daysLeft(date) {
  const target = new Date(date + 'T00:00:00');
  const now = new Date(new Date().toISOString().slice(0,10) + 'T00:00:00');
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function App() {
  const [tab, setTab] = useState('home');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState(yyyyMmDd);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [taskDate, setTaskDate] = useState(yyyyMmDd);

  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem('today-school-exams');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '중간고사', date: yyyyMmDd },
      { id: 2, title: '영어 단어 테스트', date: yyyyMmDd },
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('today-school-tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, subject: '과학', title: '탐구 보고서 제출', date: yyyyMmDd, done: false },
      { id: 2, subject: '국어', title: '독서록 1편', date: yyyyMmDd, done: false },
    ];
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('today-school-timetable');
    return saved ? JSON.parse(saved) : defaultTimetable;
  });

  const saveExams = (next) => {
    setExams(next);
    localStorage.setItem('today-school-exams', JSON.stringify(next));
  };

  const saveTasks = (next) => {
    setTasks(next);
    localStorage.setItem('today-school-tasks', JSON.stringify(next));
  };

  const saveTimetable = (next) => {
    setTimetable(next);
    localStorage.setItem('today-school-timetable', JSON.stringify(next));
  };

  const sortedExams = useMemo(() => [...exams].sort((a,b) => new Date(a.date) - new Date(b.date)), [exams]);
  const pendingTasks = tasks.filter(t => !t.done);
  const todayName = weekdays[(today.getDay() + 6) % 7] || '월';

  const addExam = () => {
    if (!examTitle.trim()) return;
    saveExams([{ id: Date.now(), title: examTitle.trim(), date: examDate }, ...exams]);
    setExamTitle('');
  };

  const addTask = () => {
    if (!taskTitle.trim()) return;
    saveTasks([{ id: Date.now(), subject: taskSubject.trim() || '기타', title: taskTitle.trim(), date: taskDate, done: false }, ...tasks]);
    setTaskTitle('');
    setTaskSubject('');
  };

  const updateClass = (day, idx, value) => {
    const next = { ...timetable, [day]: [...timetable[day]] };
    next[day][idx] = value;
    saveTimetable(next);
  };

  return (
    <div className="app">
      <header className="top">
        <div>
          <p className="eyebrow">회원가입 없이 쓰는</p>
          <h1>오늘학교</h1>
        </div>
        <div className="date">{yyyyMmDd}</div>
      </header>

      <main className="content">
        {tab === 'home' && (
          <section className="screen">
            <div className="hero">
              <p>오늘 확인할 것</p>
              <h2>수행 {pendingTasks.length}개 · 시험 {sortedExams.length}개</h2>
            </div>

            <div className="grid two">
              <Card title="오늘 급식" icon={<Utensils size={18}/>}>
                <p className="meal">{sampleMeals.today.join(' · ')}</p>
              </Card>
              <Card title={`${todayName}요일 시간표`} icon={<Clock3 size={18}/>}>
                <p className="meal">{(timetable[todayName] || timetable.월).slice(0,4).join(' · ')}</p>
              </Card>
            </div>

            <Card title="가까운 시험" icon={<CalendarDays size={18}/>}>
              {sortedExams.slice(0, 3).map(exam => (
                <div className="row" key={exam.id}>
                  <span>{exam.title}</span>
                  <strong>D{daysLeft(exam.date) === 0 ? '-DAY' : daysLeft(exam.date) > 0 ? '-' + daysLeft(exam.date) : '+' + Math.abs(daysLeft(exam.date))}</strong>
                </div>
              ))}
            </Card>

            <Card title="남은 수행평가" icon={<CheckSquare size={18}/>}>
              {pendingTasks.slice(0, 4).map(task => (
                <div className="row" key={task.id}>
                  <span>{task.subject} · {task.title}</span>
                  <small>{task.date}</small>
                </div>
              ))}
            </Card>
          </section>
        )}

        {tab === 'meal' && (
          <section className="screen">
            <Title title="급식" desc="초기 버전은 샘플 급식입니다. 나중에 NEIS 자동연동 가능." />
            <Card title="오늘 급식" icon={<Utensils size={18}/>}>
              <ul className="chips">{sampleMeals.today.map(x => <li key={x}>{x}</li>)}</ul>
            </Card>
            <Card title="내일 급식" icon={<Utensils size={18}/>}>
              <ul className="chips">{sampleMeals.tomorrow.map(x => <li key={x}>{x}</li>)}</ul>
            </Card>
          </section>
        )}

        {tab === 'table' && (
          <section className="screen">
            <Title title="시간표" desc="칸을 눌러 과목명을 바로 수정하세요." />
            <div className="timetable">
              {weekdays.map(day => (
                <Card title={`${day}요일`} key={day}>
                  {timetable[day].map((item, idx) => (
                    <div className="class-row" key={idx}>
                      <b>{idx + 1}교시</b>
                      <input value={item} onChange={(e) => updateClass(day, idx, e.target.value)} />
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          </section>
        )}

        {tab === 'exam' && (
          <section className="screen">
            <Title title="시험 D-day" desc="시험명과 날짜를 넣으면 남은 날짜가 표시됩니다." />
            <div className="form">
              <input placeholder="시험명 예: 기말고사" value={examTitle} onChange={e => setExamTitle(e.target.value)} />
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
              <button onClick={addExam}><Plus size={16}/> 추가</button>
            </div>
            {sortedExams.map(exam => (
              <Card key={exam.id} title={exam.title} icon={<CalendarDays size={18}/>}>
                <div className="row">
                  <span>{exam.date}</span>
                  <strong>D{daysLeft(exam.date) === 0 ? '-DAY' : daysLeft(exam.date) > 0 ? '-' + daysLeft(exam.date) : '+' + Math.abs(daysLeft(exam.date))}</strong>
                </div>
                <button className="delete" onClick={() => saveExams(exams.filter(e => e.id !== exam.id))}><Trash2 size={15}/> 삭제</button>
              </Card>
            ))}
          </section>
        )}

        {tab === 'task' && (
          <section className="screen">
            <Title title="수행평가" desc="과목, 할 일, 마감일을 기록하세요." />
            <div className="form">
              <input placeholder="과목" value={taskSubject} onChange={e => setTaskSubject(e.target.value)} />
              <input placeholder="수행 내용" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
              <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} />
              <button onClick={addTask}><Plus size={16}/> 추가</button>
            </div>
            {tasks.map(task => (
              <Card key={task.id} title={`${task.subject} · ${task.title}`} icon={<CheckSquare size={18}/>}>
                <div className="row">
                  <label className="check">
                    <input type="checkbox" checked={task.done} onChange={() => saveTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))} />
                    {task.done ? '완료' : '진행 중'}
                  </label>
                  <small>{task.date}</small>
                </div>
                <button className="delete" onClick={() => saveTasks(tasks.filter(t => t.id !== task.id))}><Trash2 size={15}/> 삭제</button>
              </Card>
            ))}
          </section>
        )}
      </main>

      <nav className="bottom">
        <Tab icon={<Home size={19}/>} label="홈" active={tab==='home'} onClick={() => setTab('home')} />
        <Tab icon={<Utensils size={19}/>} label="급식" active={tab==='meal'} onClick={() => setTab('meal')} />
        <Tab icon={<Clock3 size={19}/>} label="시간표" active={tab==='table'} onClick={() => setTab('table')} />
        <Tab icon={<CalendarDays size={19}/>} label="시험" active={tab==='exam'} onClick={() => setTab('exam')} />
        <Tab icon={<CheckSquare size={19}/>} label="수행" active={tab==='task'} onClick={() => setTab('task')} />
      </nav>
    </div>
  );
}

function Card({ title, icon, children }) {
  return <div className="card"><div className="card-title">{icon}<h3>{title}</h3></div>{children}</div>
}

function Title({ title, desc }) {
  return <div className="title"><h2>{title}</h2><p>{desc}</p></div>
}

function Tab({ icon, label, active, onClick }) {
  return <button className={active ? 'tab active' : 'tab'} onClick={onClick}>{icon}<span>{label}</span></button>
}

createRoot(document.getElementById('root')).render(<App />);
