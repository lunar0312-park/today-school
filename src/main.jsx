import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Utensils, CalendarDays, CheckSquare, Clock3, Plus, Trash2 } from 'lucide-react';
import './style.css';

const today = new Date();
const todayText = today.toISOString().slice(0, 10);
const weekNames = ['일', '월', '화', '수', '목', '금', '토'];
const todayWeek = weekNames[today.getDay()];

const defaultTimetable = {
  월: ['국어', '수학', '영어', '과학', '체육', '도덕'],
  화: ['수학', '사회', '국어', '미술', '영어', '창체'],
  수: ['영어', '과학', '수학', '음악', '국어', '기술'],
  목: ['사회', '영어', '체육', '수학', '국어', '과학'],
  금: ['국어', '진로', '수학', '영어', '스포츠', '동아리']
};

const meals = {
  today: ['현미밥', '미역국', '돈육불고기', '계란말이', '배추김치', '요구르트'],
  tomorrow: ['카레라이스', '유부장국', '치킨텐더', '과일샐러드', '깍두기']
};

function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getDDay(date) {
  const now = new Date(todayText + 'T00:00:00');
  const target = new Date(date + 'T00:00:00');
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-DAY';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

function App() {
  const [tab, setTab] = useState('home');
  const [exams, setExams] = useState(() => load('today-school-exams', [
    { id: 1, title: '중간고사', date: todayText },
    { id: 2, title: '영어 단어 테스트', date: todayText }
  ]));
  const [tasks, setTasks] = useState(() => load('today-school-tasks', [
    { id: 1, subject: '과학', title: '탐구 보고서 제출', date: todayText, done: false },
    { id: 2, subject: '국어', title: '독서록 제출', date: todayText, done: false }
  ]));
  const [timetable, setTimetable] = useState(() => load('today-school-timetable', defaultTimetable));

  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState(todayText);
  const [taskSubject, setTaskSubject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(todayText);

  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [exams]);

  const pendingTasks = tasks.filter((task) => !task.done);
  const todayClasses = timetable[todayWeek] || timetable.월;

  const updateExams = (next) => {
    setExams(next);
    save('today-school-exams', next);
  };

  const updateTasks = (next) => {
    setTasks(next);
    save('today-school-tasks', next);
  };

  const updateTimetable = (next) => {
    setTimetable(next);
    save('today-school-timetable', next);
  };

  const addExam = () => {
    if (!examTitle.trim()) return;
    updateExams([{ id: Date.now(), title: examTitle.trim(), date: examDate }, ...exams]);
    setExamTitle('');
  };

  const addTask = () => {
    if (!taskTitle.trim()) return;
    updateTasks([{ id: Date.now(), subject: taskSubject.trim() || '기타', title: taskTitle.trim(), date: taskDate, done: false }, ...tasks]);
    setTaskSubject('');
    setTaskTitle('');
  };

  const changeClass = (day, index, value) => {
    const next = { ...timetable, [day]: [...timetable[day]] };
    next[day][index] = value;
    updateTimetable(next);
  };

  return (
    <div className="app">
      <header className="top">
        <div>
          <span className="badge">회원가입 없음</span>
          <h1>오늘학교</h1>
          <p>{todayText} · {todayWeek}요일</p>
        </div>
      </header>

      <main>
        {tab === 'home' && (
          <section className="screen">
            <div className="hero">
              <p>오늘 체크할 것</p>
              <h2>수행 {pendingTasks.length}개 · 시험 {sortedExams.length}개</h2>
            </div>

            <div className="two">
              <Card title="오늘 급식" icon={<Utensils size={18} />}>
                <p className="line">{meals.today.join(' · ')}</p>
              </Card>
              <Card title="오늘 시간표" icon={<Clock3 size={18} />}>
                <p className="line">{todayClasses.slice(0, 4).join(' · ')}</p>
              </Card>
            </div>

            <Card title="가까운 시험" icon={<CalendarDays size={18} />}>
              {sortedExams.slice(0, 3).map((exam) => (
                <div className="row" key={exam.id}>
                  <span>{exam.title}</span>
                  <strong>{getDDay(exam.date)}</strong>
                </div>
              ))}
            </Card>

            <Card title="남은 수행평가" icon={<CheckSquare size={18} />}>
              {pendingTasks.length === 0 && <p className="empty">남은 수행평가가 없습니다.</p>}
              {pendingTasks.slice(0, 4).map((task) => (
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
            <PageTitle title="급식" desc="초기 버전은 샘플 급식입니다. 나중에 NEIS 자동연동으로 확장할 수 있습니다." />
            <Card title="오늘 급식" icon={<Utensils size={18} />}>
              <div className="chips">{meals.today.map((m) => <span key={m}>{m}</span>)}</div>
            </Card>
            <Card title="내일 급식" icon={<Utensils size={18} />}>
              <div className="chips">{meals.tomorrow.map((m) => <span key={m}>{m}</span>)}</div>
            </Card>
          </section>
        )}

        {tab === 'table' && (
          <section className="screen">
            <PageTitle title="시간표" desc="과목명을 눌러 바로 수정하세요." />
            {['월', '화', '수', '목', '금'].map((day) => (
              <Card key={day} title={`${day}요일`} icon={<Clock3 size={18} />}>
                {timetable[day].map((subject, index) => (
                  <div className="classRow" key={index}>
                    <b>{index + 1}교시</b>
                    <input value={subject} onChange={(e) => changeClass(day, index, e.target.value)} />
                  </div>
                ))}
              </Card>
            ))}
          </section>
        )}

        {tab === 'exam' && (
          <section className="screen">
            <PageTitle title="시험 D-day" desc="시험명과 날짜를 넣으면 자동으로 D-day가 표시됩니다." />
            <div className="form">
              <input placeholder="시험명" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} />
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              <button onClick={addExam}><Plus size={16} /> 추가</button>
            </div>
            {sortedExams.map((exam) => (
              <Card key={exam.id} title={exam.title} icon={<CalendarDays size={18} />}>
                <div className="row">
                  <span>{exam.date}</span>
                  <strong>{getDDay(exam.date)}</strong>
                </div>
                <button className="delete" onClick={() => updateExams(exams.filter((item) => item.id !== exam.id))}>
                  <Trash2 size={15} /> 삭제
                </button>
              </Card>
            ))}
          </section>
        )}

        {tab === 'task' && (
          <section className="screen">
            <PageTitle title="수행평가" desc="과목, 내용, 마감일을 기록하세요." />
            <div className="form">
              <input placeholder="과목" value={taskSubject} onChange={(e) => setTaskSubject(e.target.value)} />
              <input placeholder="수행 내용" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
              <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
              <button onClick={addTask}><Plus size={16} /> 추가</button>
            </div>

            {tasks.map((task) => (
              <Card key={task.id} title={`${task.subject} · ${task.title}`} icon={<CheckSquare size={18} />}>
                <div className="row">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => updateTasks(tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))}
                    />
                    {task.done ? '완료' : '진행 중'}
                  </label>
                  <small>{task.date}</small>
                </div>
                <button className="delete" onClick={() => updateTasks(tasks.filter((item) => item.id !== task.id))}>
                  <Trash2 size={15} /> 삭제
                </button>
              </Card>
            ))}
          </section>
        )}
      </main>

      <nav className="bottom">
        <Tab active={tab === 'home'} icon={<Home size={19} />} label="홈" onClick={() => setTab('home')} />
        <Tab active={tab === 'meal'} icon={<Utensils size={19} />} label="급식" onClick={() => setTab('meal')} />
        <Tab active={tab === 'table'} icon={<Clock3 size={19} />} label="시간표" onClick={() => setTab('table')} />
        <Tab active={tab === 'exam'} icon={<CalendarDays size={19} />} label="시험" onClick={() => setTab('exam')} />
        <Tab active={tab === 'task'} icon={<CheckSquare size={19} />} label="수행" onClick={() => setTab('task')} />
      </nav>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="card">
      <div className="cardTitle">{icon}<h3>{title}</h3></div>
      {children}
    </div>
  );
}

function PageTitle({ title, desc }) {
  return (
    <div className="pageTitle">
      <h2>{title}</h2>
      <p>{desc}</p>
    </div>
  );
}

function Tab({ active, icon, label, onClick }) {
  return (
    <button className={active ? 'tab active' : 'tab'} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

createRoot(document.getElementById('root')).render(<App />);
