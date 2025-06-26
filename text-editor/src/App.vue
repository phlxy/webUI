<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

interface SummaryItem {
  doc_id: number;
  summary_json: string;
  validation_status: string;
}

const summary = ref<SummaryItem[]>([]);
const editingId = ref<number | null>(null);
const editingText = ref('');
const checkedStatus = ref(['pending', 'correct']);
const isMobile = ref(false);

onMounted(async () => {
  await fetchSummary();
});

async function fetchSummary() {
  try {
    const response = await axios.get('http://localhost:3001/api/doc');
    summary.value = response.data;
  } catch (error) {
    console.error('Error fetching doc:', error);
  }
}

function editItem(item: any) {
  editingId.value = item.doc_id;
  try {
    editingText.value = JSON.stringify(JSON.parse(item.summary_json), null, 2);
  } catch {
    editingText.value = item.summary_json;
  }
}

async function saveEdit() {
  if (editingId.value === null) return;
  try {
    const jsonString = JSON.stringify(JSON.parse(editingText.value));
    await axios.put(`http://localhost:3001/api/doc/${editingId.value}`, {
      summary_json: jsonString,
      validation_status: 'correct'
    });
    await fetchSummary();
    editingId.value = null;
    editingText.value = '';
  } catch (error) {
    console.error('Error updating doc:', error);
  }
}

function cancelEdit() {
  editingId.value = null;
  editingText.value = '';
}

const filteredSummary = computed(() => {
  if (checkedStatus.value.length === 0) return [];
  return summary.value.filter(item => checkedStatus.value.includes(item.validation_status));
});

const showAll = ref(true);

function toggleShowAll() {
  showAll.value = !showAll.value;
}
</script>

<template>
  <h1 class="title">Welcome to Text Editor</h1>
  <div class="filter-bar">
    <label>Filter:</label>
    <label>
      <input type="checkbox" value="pending" v-model="checkedStatus" />
      ยังไม่แก้ไข
    </label>
    <label>
      <input type="checkbox" value="correct" v-model="checkedStatus" />
      แก้ไขแล้ว
    </label>
    <button class="toggle-all-btn" @click="toggleShowAll">
      {{ showAll ? 'ซ่อนข้อมูลทั้งหมด' : 'แสดงข้อมูลทั้งหมด' }}
    </button>
  </div>
  <div class="editor-layout">
    <div class="list-panel" v-if="showAll">
      <ul v-if="!isMobile">
        <li v-for="item in filteredSummary" :key="item.doc_id" :class="{ active: editingId === item.doc_id }"
          @click="editItem(item)">
          <span>doc_id: {{ item.doc_id }}</span>
          <span style="margin-left:10px;" :style="{
            color: item.validation_status === 'pending' ? '#e53935' : '#388e3c',
            fontWeight: 'bold'
          }">
            {{ item.validation_status }}
          </span>
        </li>
      </ul>
      <div v-else >
        <ul v-if="!isMobile">
          <li v-for="item in filteredSummary" :key="item.doc_id" :class="{ active: editingId === item.doc_id }"
            @click="editItem(item)">
            <span>doc_id: {{ item.doc_id }}</span>
            <span style="margin-left:10px;" :style="{
              color: item.validation_status === 'pending' ? '#e53935' : '#388e3c',
              fontWeight: 'bold'
            }">
              {{ item.validation_status }}
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="edit-panel">
      <textarea v-model="editingText" rows="15" cols="50" placeholder="แสดงข้อมูลที่ต้องการแก้ไข..."
        :disabled="editingId === null"></textarea>
      <div v-if="editingId !== null" class="edit-actions">
        <button @click="saveEdit" class="save-button">บันทึก</button>
        <button @click="cancelEdit" class="cancel-button">ยกเลิก</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  gap: 5px;
  width: 100%;
  justify-content: center;
  align-items: flex-start;
  margin-top: 10px;
  margin: 0;
}

.list-panel {
  width: 500px;
  max-height: 500px;
  overflow-y: auto;
}

.edit-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

textarea {
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  background: #fafafa;
  width: 100%;
  font-size: 1.1em;
  min-height: 500px;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

li {
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 450px;
}

li.active {
  background: #e0f7fa;
  border-color: #00bcd4;
}

li:hover {
  background: #f9f9f9;
  cursor: pointer;
}

.edit-actions button {
  margin-right: 10px;
}

.title {
  color: #333;
  font-family: cursive, sans-serif;
  font-weight: bold;
  text-align: center;
  margin: 0;
  padding: 10px;
}

.save-button {
  background-color: #4caf50;
  font-family: cursive, sans-serif;
  font-weight: bold;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #45a049;
}

.cancel-button {
  background-color: #f44336;
  font-family: cursive, sans-serif;
  font-weight: bold;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #e53935;
}

.filter-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  background: #fafafa;
  border-radius: 8px;
  padding: 10px 20px;
  margin-bottom: 5px;
  box-shadow: 0 2px 8px rgba(0, 188, 212, 0.07);
}

.filter-bar label {
  font-family: 'Roboto', sans-serif;
  font-size: 1.08em;
  color: black;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.filter-bar input[type="checkbox"] {
  accent-color: #00bcd4;
  width: 18px;
  height: 18px;
  margin-right: 5px;
  border-radius: 4px;
  border: 1.5px solid #00bcd4;
  transition: box-shadow 0.2s;
}

.filter-bar input[type="checkbox"]:hover {
  box-shadow: 0 0 0 2px #b2ebf2;
}

@media (max-width: 900px) {
  .editor-layout {
    flex-direction: column;
    align-items: stretch;
  }

  .list-panel,
  .edit-panel {
    width: 100%;
    max-width: 100%;
  }

  li {
    width: 95%;
  }

  textarea {
    min-height: 450px;
  }
}

.toggle-all-btn {
  margin-left: 16px;
  padding: 7px 16px;
  border: none;
  border-radius: 4px;
  background: #00bcd4;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-all-btn:hover {
  background: #0097a7;
}
</style>
