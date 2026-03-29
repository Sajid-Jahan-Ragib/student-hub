import React from 'react';
import { Card, Tile } from '../Common/index';

export function AdminPanels(props) {
  const source = props.model || props;
  const {
    activeTool,
    currentTime,
    openProfileEditor,
    openRoutinesEditor,
    openFeesEditor,
    openCalendarEditor,
    openDownloadsEditor,
    openCoursesEditor,
    openPendingCoursesEditor,
    openMarksEditor,
    closeProfileEditor,
    openProfileNormalEditor,
    openProfileJsonEditor,
    backToProfileOptions,
    handleSave,
    formData,
    handleInputChange,
    handleProfileImageUpload,
    handleReset,
    profileDirty,
    saveError,
    saveMessage,
    profileJsonText,
    handleProfileJsonChange,
    PROFILE_JSON_PLACEHOLDER,
    profileJsonSaving,
    profileJsonSaveError,
    profileJsonSaveMessage,
    closeRoutinesEditor,
    openRoutinesNormalEditor,
    openRoutinesJsonEditor,
    backToRoutineOptions,
    handleRoutineSave,
    selectedRoutineSemesterKey,
    handleSelectRoutineSemester,
    routineSemesterItems,
    handleAddRoutineSemester,
    handleRemoveRoutineSemester,
    routineSemester,
    handleRoutineSemesterNameChange,
    routineItems,
    handleRemoveRoutineItem,
    handleRoutineFieldChange,
    handleAddRoutineItem,
    handleRoutineReset,
    routineDirty,
    routineSaveError,
    routineSaveMessage,
    handleRoutineSemesterJsonAdd,
    routineSemesterJsonText,
    setRoutineSemesterJsonText,
    setRoutineSemesterJsonAddError,
    setRoutineSemesterJsonAddMessage,
    ROUTINE_SEMESTER_JSON_PLACEHOLDER,
    routineSemesterJsonAdding,
    routineSemesterJsonAddError,
    routineSemesterJsonAddMessage,
    routineJsonText,
    handleRoutineJsonChange,
    ROUTINES_JSON_PLACEHOLDER,
    routineJsonSaving,
    routineJsonSaveError,
    routineJsonSaveMessage,
    closeFeesEditor,
    openFeesNormalEditor,
    openFeesJsonEditor,
    backToFeeOptions,
    handleFeeSave,
    selectedFeeSemesterKey,
    handleSelectFeeSemester,
    feeItems,
    handleAddFeeItem,
    handleRemoveFeeItem,
    feeForm,
    handleFeeFieldChange,
    handleFeeReset,
    feeDirty,
    feeSaveError,
    feeSaveMessage,
    handleFeeSemesterJsonAdd,
    feeSemesterJsonText,
    setFeeSemesterJsonText,
    setFeeSemesterJsonAddError,
    setFeeSemesterJsonAddMessage,
    FEE_SEMESTER_JSON_PLACEHOLDER,
    feeSemesterJsonAdding,
    feeSemesterJsonAddError,
    feeSemesterJsonAddMessage,
    feeJsonText,
    handleFeeJsonChange,
    FEES_JSON_PLACEHOLDER,
    feeJsonSaving,
    feeJsonSaveError,
    feeJsonSaveMessage,
    closeMarksEditor,
    openMarksNormalEditor,
    openMarksJsonEditor,
    backToMarksOptions,
    handleMarksSave,
    selectedMarksSemester,
    handleSelectMarksSemester,
    marksEditorSemesters,
    marksSubjectRows,
    handleMarkChange,
    handleMarksReset,
    marksDirty,
    marksSaveError,
    marksSaveMessage,
    marksJsonText,
    handleMarksJsonChange,
    MARKS_JSON_PLACEHOLDER,
    marksJsonSaving,
    marksJsonSaveError,
    marksJsonSaveMessage,
    closeCalendarEditor,
    openCalendarNormalEditor,
    openCalendarJsonEditor,
    backToCalendarOptions,
    handleCalendarSave,
    calendarItems,
    handleRemoveCalendarItem,
    handleCalendarFieldChange,
    handleAddCalendarItem,
    handleCalendarReset,
    calendarDirty,
    calendarSaveError,
    calendarSaveMessage,
    calendarJsonText,
    handleCalendarJsonChange,
    CALENDAR_JSON_PLACEHOLDER,
    calendarJsonSaving,
    calendarJsonSaveError,
    calendarJsonSaveMessage,
    closeDownloadsEditor,
    openDownloadsNormalEditor,
    openDownloadsJsonEditor,
    backToDownloadsOptions,
    handleDownloadSave,
    downloadItems,
    handleRemoveDownloadItem,
    handleDownloadFieldChange,
    handleAddDownloadItem,
    handleDownloadReset,
    downloadDirty,
    downloadSaveError,
    downloadSaveMessage,
    downloadJsonText,
    handleDownloadJsonChange,
    DOWNLOADS_JSON_PLACEHOLDER,
    downloadJsonSaving,
    downloadJsonSaveError,
    downloadJsonSaveMessage,
    closeCoursesEditor,
    openCoursesNormalEditor,
    openCoursesJsonEditor,
    backToCourseOptions,
    handleCourseSave,
    selectedCourseSemesterKey,
    handleSelectCourseSemester,
    courseSemesterItems,
    handleAddCourseSemester,
    handleRemoveCourseSemester,
    courseSemester,
    handleCourseSemesterNameChange,
    courseItems,
    handleRemoveCourseItem,
    handleCourseFieldChange,
    handleAddCourseItem,
    handleCourseReset,
    courseDirty,
    courseSaveError,
    courseSaveMessage,
    courseJsonText,
    handleCourseJsonChange,
    COURSES_JSON_PLACEHOLDER,
    courseJsonSaving,
    courseJsonSaveError,
    courseJsonSaveMessage,
    closePendingCoursesEditor,
    openPendingCoursesNormalEditor,
    openPendingCoursesJsonEditor,
    backToPendingCourseOptions,
    handlePendingCourseSave,
    pendingCourseItems,
    handleRemovePendingCourseItem,
    handlePendingCourseFieldChange,
    handleAddPendingCourseItem,
    handlePendingCourseReset,
    pendingCourseDirty,
    pendingCourseSaveError,
    pendingCourseSaveMessage,
    pendingCourseJsonText,
    handlePendingCourseJsonChange,
    PENDING_COURSES_JSON_PLACEHOLDER,
    pendingCourseJsonSaving,
    pendingCourseJsonSaveError,
    pendingCourseJsonSaveMessage,
  } = source;

  return (
    <>
      {!activeTool && (
        <>
          <Card variant="default">{currentTime}</Card>

          <section className="tiles" aria-label="Admin tools">
            <Tile icon="badge" label="Profile" onClick={openProfileEditor} />
            <Tile icon="calendar_month" label="Routines" onClick={openRoutinesEditor} />
            <Tile icon="payments" label="Fees & Waives" onClick={openFeesEditor} />
            <Tile icon="event" label="Academic Calendar" onClick={openCalendarEditor} />
            <Tile icon="download" label="Downloads" onClick={openDownloadsEditor} />
            <Tile icon="menu_book" label="All Courses" onClick={openCoursesEditor} />
            <Tile icon="schedule" label="Pending Courses" onClick={openPendingCoursesEditor} />
            <Tile icon="calculate" label="Results & Marks" onClick={openMarksEditor} />
          </section>
        </>
      )}

      {activeTool === 'profile-options' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Profile Editor Options</h2>
            <button type="button" className="admin-form__reset" onClick={closeProfileEditor}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Choose how you want to edit profile: normal form fields or direct JSON paste.
          </p>

          <section className="tiles" aria-label="Profile edit options">
            <Tile icon="edit_note" label="Normal Edit" onClick={openProfileNormalEditor} />
            <Tile icon="data_object" label="JSON Edit" onClick={openProfileJsonEditor} />
          </section>
        </article>
      )}

      {activeTool === 'profile-normal' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Profile Editor (Normal)</h2>
            <button type="button" className="admin-form__reset" onClick={backToProfileOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Any changes here are connected to the main profile on dashboard and profile page.
          </p>

          <form className="admin-form" onSubmit={handleSave}>
            <label className="admin-form__field">
              <span>Name</span>
              <input name="name" value={formData.name} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Student ID</span>
              <input name="id" value={formData.id} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Department</span>
              <input name="department" value={formData.department} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Program</span>
              <input name="program" value={formData.program} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Intake</span>
              <input name="intake" value={formData.intake} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </label>
            <label className="admin-form__field">
              <span>Mobile</span>
              <input name="mobile" value={formData.mobile} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Gender</span>
              <input name="gender" value={formData.gender} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Blood Group</span>
              <input name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Admission Semester</span>
              <input
                name="admissionSemester"
                value={formData.admissionSemester}
                onChange={handleInputChange}
              />
            </label>
            <label className="admin-form__field">
              <span>Upload Profile Picture</span>
              <input type="file" accept="image/*" onChange={handleProfileImageUpload} />
            </label>
            <label className="admin-form__field">
              <span>Avatar URL</span>
              <input name="avatar" value={formData.avatar} onChange={handleInputChange} />
            </label>
            <label className="admin-form__field">
              <span>Small Avatar URL</span>
              <input name="avatarSmall" value={formData.avatarSmall} onChange={handleInputChange} />
            </label>
            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Save Profile
              </button>
              <button type="button" className="admin-form__reset" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>

          {profileDirty && <p className="admin-form__dirty">You have unsaved changes.</p>}
          {saveError && <p className="admin-form__error">{saveError}</p>}
          {saveMessage && <p className="admin-form__success">{saveMessage}</p>}
        </article>
      )}

      {activeTool === 'profile-json' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Profile Editor (JSON)</h2>
            <button type="button" className="admin-form__reset" onClick={backToProfileOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Paste profile JSON below. When JSON is valid, it is saved automatically.
          </p>

          <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-form__field">
              <span>Profile JSON</span>
              <textarea
                rows={18}
                value={profileJsonText}
                onChange={handleProfileJsonChange}
                placeholder={PROFILE_JSON_PLACEHOLDER}
              />
            </label>
          </form>

          {profileJsonSaving && <p className="admin-form__dirty">Auto-saving JSON...</p>}
          {profileJsonSaveError && <p className="admin-form__error">{profileJsonSaveError}</p>}
          {profileJsonSaveMessage && (
            <p className="admin-form__success">{profileJsonSaveMessage}</p>
          )}
        </article>
      )}

      {activeTool === 'routines-options' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Routines Editor Options</h2>
            <button type="button" className="admin-form__reset" onClick={closeRoutinesEditor}>
              Back
            </button>
          </div>
          <p className="admin-note">
            Choose how you want to edit routines: semester-wise normal editor or direct JSON editor.
          </p>
          <section className="tiles" aria-label="Routines edit options">
            <Tile icon="event_note" label="Normal Edit" onClick={openRoutinesNormalEditor} />
            <Tile icon="data_object" label="JSON Edit" onClick={openRoutinesJsonEditor} />
          </section>
        </article>
      )}

      {activeTool === 'routines-normal' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Routines Editor (Normal)</h2>
            <button type="button" className="admin-form__reset" onClick={backToRoutineOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Manage routines by semester. You can add or remove semesters and class slots.
          </p>

          <form className="admin-form" onSubmit={handleRoutineSave}>
            <label className="admin-form__field">
              <span>Semester Selector</span>
              <select
                value={selectedRoutineSemesterKey}
                onChange={(event) => handleSelectRoutineSemester(event.target.value)}
              >
                {routineSemesterItems.map((entry, index) => (
                  <option key={entry._uiKey} value={entry._uiKey}>
                    {entry.semester || `Semester #${index + 1}`}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-form__actions">
              <button
                type="button"
                className="admin-form__secondary"
                onClick={handleAddRoutineSemester}
              >
                + Add Semester
              </button>
              <button
                type="button"
                className="admin-form__reset"
                onClick={handleRemoveRoutineSemester}
              >
                Remove Semester
              </button>
            </div>

            <label className="admin-form__field">
              <span>Semester</span>
              <input
                name="semester"
                value={routineSemester}
                onChange={(event) => handleRoutineSemesterNameChange(event.target.value)}
              />
            </label>

            <div className="admin-routine-list">
              {routineItems.map((item, index) => (
                <section key={item._uiKey || index} className="admin-routine-item">
                  <div className="admin-routine-item__head">
                    <h3 className="admin-routine-item__title">Class #{index + 1}</h3>
                    <button
                      type="button"
                      className="admin-routine-item__remove"
                      onClick={() => handleRemoveRoutineItem(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="admin-routine-item__grid">
                    <label className="admin-form__field">
                      <span>Day</span>
                      <input
                        value={item.day || ''}
                        onChange={(e) => handleRoutineFieldChange(index, 'day', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Time</span>
                      <input
                        value={item.time || ''}
                        onChange={(e) => handleRoutineFieldChange(index, 'time', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Course</span>
                      <input
                        value={item.course || ''}
                        onChange={(e) => handleRoutineFieldChange(index, 'course', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Faculty Code (FC)</span>
                      <input
                        value={item.fc || ''}
                        onChange={(e) => handleRoutineFieldChange(index, 'fc', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Room</span>
                      <input
                        value={item.room || ''}
                        onChange={(e) => handleRoutineFieldChange(index, 'room', e.target.value)}
                      />
                    </label>
                  </div>
                </section>
              ))}
            </div>

            <button type="button" className="admin-form__secondary" onClick={handleAddRoutineItem}>
              + Add New Class Slot
            </button>

            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Save Routine
              </button>
              <button type="button" className="admin-form__reset" onClick={handleRoutineReset}>
                Reset
              </button>
            </div>
          </form>

          {routineDirty && <p className="admin-form__dirty">You have unsaved routine changes.</p>}
          {routineSaveError && <p className="admin-form__error">{routineSaveError}</p>}
          {routineSaveMessage && <p className="admin-form__success">{routineSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'routines-json' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Routines Editor (JSON)</h2>
            <button type="button" className="admin-form__reset" onClick={backToRoutineOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Paste routines JSON below. When JSON is valid, it is saved automatically.
          </p>

          <form className="admin-form" onSubmit={handleRoutineSemesterJsonAdd}>
            <label className="admin-form__field">
              <span>Paste Per Semester JSON</span>
              <textarea
                rows={8}
                value={routineSemesterJsonText}
                onChange={(event) => {
                  setRoutineSemesterJsonText(event.target.value);
                  setRoutineSemesterJsonAddError('');
                  setRoutineSemesterJsonAddMessage('');
                }}
                placeholder={ROUTINE_SEMESTER_JSON_PLACEHOLDER}
              />
            </label>

            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Add Semester JSON
              </button>
            </div>
          </form>

          {routineSemesterJsonAdding && (
            <p className="admin-form__dirty">Adding semester JSON...</p>
          )}
          {routineSemesterJsonAddError && (
            <p className="admin-form__error">{routineSemesterJsonAddError}</p>
          )}
          {routineSemesterJsonAddMessage && (
            <p className="admin-form__success">{routineSemesterJsonAddMessage}</p>
          )}

          <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-form__field">
              <span>Routines JSON</span>
              <textarea
                rows={18}
                value={routineJsonText}
                onChange={handleRoutineJsonChange}
                placeholder={ROUTINES_JSON_PLACEHOLDER}
              />
            </label>
          </form>

          {routineJsonSaving && <p className="admin-form__dirty">Auto-saving JSON...</p>}
          {routineJsonSaveError && <p className="admin-form__error">{routineJsonSaveError}</p>}
          {routineJsonSaveMessage && (
            <p className="admin-form__success">{routineJsonSaveMessage}</p>
          )}
        </article>
      )}

      {activeTool === 'fees-options' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Fees & Waivers Editor Options</h2>
            <button type="button" className="admin-form__reset" onClick={closeFeesEditor}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Choose how you want to edit fees: normal form editor or direct JSON editor.
          </p>

          <section className="tiles" aria-label="Fees edit options">
            <Tile icon="payments" label="Normal Edit" onClick={openFeesNormalEditor} />
            <Tile icon="data_object" label="JSON Edit" onClick={openFeesJsonEditor} />
          </section>
        </article>
      )}

      {activeTool === 'fees-normal' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Fees & Waives Editor (Normal)</h2>
            <button type="button" className="admin-form__reset" onClick={backToFeeOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Manage semester fee reports with a semester-first editor similar to routines.
          </p>

          <form className="admin-form" onSubmit={handleFeeSave}>
            <label className="admin-form__field">
              <span>Semester Selector</span>
              <select
                value={selectedFeeSemesterKey}
                onChange={(event) => handleSelectFeeSemester(event.target.value)}
              >
                {feeItems.map((entry, index) => (
                  <option key={entry._uiKey} value={entry._uiKey}>
                    {entry.semester || `Semester #${index + 1}`}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-form__actions">
              <button type="button" className="admin-form__secondary" onClick={handleAddFeeItem}>
                + Add Semester
              </button>
              <button type="button" className="admin-form__reset" onClick={handleRemoveFeeItem}>
                Remove Semester
              </button>
            </div>

            <div className="admin-routine-item">
              <div className="admin-routine-item__grid">
                <label className="admin-form__field">
                  <span>Semester</span>
                  <input
                    value={feeForm.semester || ''}
                    onChange={(e) => handleFeeFieldChange(0, 'semester', e.target.value)}
                  />
                </label>
                <label className="admin-form__field">
                  <span>Demand</span>
                  <input
                    value={feeForm.demand ?? ''}
                    onChange={(e) => handleFeeFieldChange(0, 'demand', e.target.value)}
                  />
                </label>
                <label className="admin-form__field">
                  <span>Waiver</span>
                  <input
                    value={feeForm.waiver ?? ''}
                    onChange={(e) => handleFeeFieldChange(0, 'waiver', e.target.value)}
                  />
                </label>
                <label className="admin-form__field">
                  <span>Paid</span>
                  <input
                    value={feeForm.paid ?? ''}
                    onChange={(e) => handleFeeFieldChange(0, 'paid', e.target.value)}
                  />
                </label>
                <label className="admin-form__field">
                  <span>Status</span>
                  <select
                    value={feeForm.status || 'ok'}
                    onChange={(e) => handleFeeFieldChange(0, 'status', e.target.value)}
                  >
                    <option value="ok">ok</option>
                    <option value="due">due</option>
                  </select>
                </label>
                <label className="admin-form__field">
                  <span>Status Text</span>
                  <input
                    value={feeForm.statusText || ''}
                    onChange={(e) => handleFeeFieldChange(0, 'statusText', e.target.value)}
                  />
                </label>
                <label className="admin-form__field">
                  <span>Status Amount</span>
                  <input
                    value={feeForm.statusAmount ?? ''}
                    onChange={(e) => handleFeeFieldChange(0, 'statusAmount', e.target.value)}
                  />
                </label>
              </div>
            </div>

            {feeItems.length === 0 && (
              <p className="admin-note">No semester fee entries available.</p>
            )}

            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Save Fees
              </button>
              <button type="button" className="admin-form__reset" onClick={handleFeeReset}>
                Reset
              </button>
            </div>
          </form>

          {feeDirty && <p className="admin-form__dirty">You have unsaved fees changes.</p>}
          {feeSaveError && <p className="admin-form__error">{feeSaveError}</p>}
          {feeSaveMessage && <p className="admin-form__success">{feeSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'fees-json' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Fees & Waives Editor (JSON)</h2>
            <button type="button" className="admin-form__reset" onClick={backToFeeOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Paste per-semester fee JSON and click add, or use full fees JSON editor below.
          </p>

          <form className="admin-form" onSubmit={handleFeeSemesterJsonAdd}>
            <label className="admin-form__field">
              <span>Paste Per Semester Fee JSON</span>
              <textarea
                rows={8}
                value={feeSemesterJsonText}
                onChange={(event) => {
                  setFeeSemesterJsonText(event.target.value);
                  setFeeSemesterJsonAddError('');
                  setFeeSemesterJsonAddMessage('');
                }}
                placeholder={FEE_SEMESTER_JSON_PLACEHOLDER}
              />
            </label>
            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Add Semester Fee JSON
              </button>
            </div>
          </form>

          {feeSemesterJsonAdding && (
            <p className="admin-form__dirty">Adding semester fee JSON...</p>
          )}
          {feeSemesterJsonAddError && (
            <p className="admin-form__error">{feeSemesterJsonAddError}</p>
          )}
          {feeSemesterJsonAddMessage && (
            <p className="admin-form__success">{feeSemesterJsonAddMessage}</p>
          )}

          <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-form__field">
              <span>Fees JSON</span>
              <textarea
                rows={18}
                value={feeJsonText}
                onChange={handleFeeJsonChange}
                placeholder={FEES_JSON_PLACEHOLDER}
              />
            </label>
          </form>

          {feeJsonSaving && <p className="admin-form__dirty">Auto-saving JSON...</p>}
          {feeJsonSaveError && <p className="admin-form__error">{feeJsonSaveError}</p>}
          {feeJsonSaveMessage && <p className="admin-form__success">{feeJsonSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'marks-options' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Results & Marks Editor Options</h2>
            <button type="button" className="admin-form__reset" onClick={closeMarksEditor}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Choose how you want to edit marks: semester-wise normal editor or direct JSON editor.
          </p>

          <section className="tiles" aria-label="Results and marks edit options">
            <Tile icon="calculate" label="Normal Edit" onClick={openMarksNormalEditor} />
            <Tile icon="data_object" label="JSON Edit" onClick={openMarksJsonEditor} />
          </section>
        </article>
      )}

      {activeTool === 'marks-normal' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Results & Marks Editor (Normal)</h2>
            <button type="button" className="admin-form__reset" onClick={backToMarksOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Edit subject marks by semester. Save recalculates SGPA/CGPA in Results and updates
            grades in All Courses.
          </p>

          <form className="admin-form" onSubmit={handleMarksSave}>
            <label className="admin-form__field">
              <span>Semester Selector</span>
              <select
                value={selectedMarksSemester}
                onChange={(event) => handleSelectMarksSemester(event.target.value)}
              >
                {marksEditorSemesters.map((entry, index) => (
                  <option key={entry.semester || `marks-sem-${index}`} value={entry.semester}>
                    {entry.semester || `Semester #${index + 1}`}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-routine-list">
              {marksSubjectRows.map((item, index) => (
                <section key={`${item.code || 'subject'}-${index}`} className="admin-routine-item">
                  <div className="admin-routine-item__head">
                    <h3 className="admin-routine-item__title">
                      {item.code || `Subject #${index + 1}`}
                    </h3>
                  </div>
                  <div className="admin-routine-item__grid">
                    <label className="admin-form__field">
                      <span>Course Code</span>
                      <input value={item.code || ''} readOnly />
                    </label>
                    <label className="admin-form__field">
                      <span>Course Name</span>
                      <input value={item.name || ''} readOnly />
                    </label>
                    <label className="admin-form__field">
                      <span>Mark (0-100)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.mark ?? ''}
                        onChange={(e) => handleMarkChange(item.code, e.target.value)}
                      />
                    </label>
                  </div>
                </section>
              ))}
            </div>

            {marksSubjectRows.length === 0 && (
              <p className="admin-note">No subjects available for the selected semester.</p>
            )}

            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Save Marks & Recalculate
              </button>
              <button type="button" className="admin-form__reset" onClick={handleMarksReset}>
                Reset
              </button>
            </div>
          </form>

          {marksDirty && <p className="admin-form__dirty">You have unsaved marks changes.</p>}
          {marksSaveError && <p className="admin-form__error">{marksSaveError}</p>}
          {marksSaveMessage && <p className="admin-form__success">{marksSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'marks-json' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Results & Marks Editor (JSON)</h2>
            <button type="button" className="admin-form__reset" onClick={backToMarksOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Paste marks JSON below. When JSON is valid, it is saved automatically and academic
            summary is recalculated.
          </p>

          <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-form__field">
              <span>Marks JSON</span>
              <textarea
                rows={18}
                value={marksJsonText}
                onChange={handleMarksJsonChange}
                placeholder={MARKS_JSON_PLACEHOLDER}
              />
            </label>
          </form>

          {marksJsonSaving && <p className="admin-form__dirty">Auto-saving JSON...</p>}
          {marksJsonSaveError && <p className="admin-form__error">{marksJsonSaveError}</p>}
          {marksJsonSaveMessage && <p className="admin-form__success">{marksJsonSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'calendar-options' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Academic Calendar Editor Options</h2>
            <button type="button" className="admin-form__reset" onClick={closeCalendarEditor}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Choose how you want to edit calendar: normal form editor or direct JSON editor.
          </p>

          <section className="tiles" aria-label="Calendar edit options">
            <Tile icon="event" label="Normal Edit" onClick={openCalendarNormalEditor} />
            <Tile icon="data_object" label="JSON Edit" onClick={openCalendarJsonEditor} />
          </section>
        </article>
      )}

      {activeTool === 'calendar-normal' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Academic Calendar Editor</h2>
            <button type="button" className="admin-form__reset" onClick={backToCalendarOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Edit academic calendar events here. Save will update JSON and the Calendar section.
          </p>

          <form className="admin-form" onSubmit={handleCalendarSave}>
            <div className="admin-routine-list">
              {calendarItems.map((item, index) => (
                <section key={item._uiKey || index} className="admin-routine-item">
                  <div className="admin-routine-item__head">
                    <h3 className="admin-routine-item__title">Event #{index + 1}</h3>
                    <button
                      type="button"
                      className="admin-routine-item__remove"
                      onClick={() => handleRemoveCalendarItem(index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="admin-routine-item__grid">
                    <label className="admin-form__field">
                      <span>Title</span>
                      <input
                        value={item.title || ''}
                        onChange={(e) => handleCalendarFieldChange(index, 'title', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Date Text</span>
                      <input
                        value={item.dateText || ''}
                        onChange={(e) =>
                          handleCalendarFieldChange(index, 'dateText', e.target.value)
                        }
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Tag Type</span>
                      <input
                        value={item.tagType || ''}
                        onChange={(e) =>
                          handleCalendarFieldChange(index, 'tagType', e.target.value)
                        }
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Tag Text</span>
                      <input
                        value={item.tagText || ''}
                        onChange={(e) =>
                          handleCalendarFieldChange(index, 'tagText', e.target.value)
                        }
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Start Date (YYYY-MM-DD)</span>
                      <input
                        value={item.start || ''}
                        onChange={(e) => handleCalendarFieldChange(index, 'start', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>End Date (YYYY-MM-DD)</span>
                      <input
                        value={item.end || ''}
                        onChange={(e) => handleCalendarFieldChange(index, 'end', e.target.value)}
                      />
                    </label>
                  </div>
                </section>
              ))}
            </div>

            <button type="button" className="admin-form__secondary" onClick={handleAddCalendarItem}>
              + Add New Calendar Event
            </button>

            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Save Calendar
              </button>
              <button type="button" className="admin-form__reset" onClick={handleCalendarReset}>
                Reset
              </button>
            </div>
          </form>

          {calendarDirty && <p className="admin-form__dirty">You have unsaved calendar changes.</p>}
          {calendarSaveError && <p className="admin-form__error">{calendarSaveError}</p>}
          {calendarSaveMessage && <p className="admin-form__success">{calendarSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'calendar-json' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Academic Calendar Editor (JSON)</h2>
            <button type="button" className="admin-form__reset" onClick={backToCalendarOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Paste academic calendar JSON below. When JSON is valid, it is saved automatically.
          </p>

          <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-form__field">
              <span>Calendar JSON</span>
              <textarea
                rows={18}
                value={calendarJsonText}
                onChange={handleCalendarJsonChange}
                placeholder={CALENDAR_JSON_PLACEHOLDER}
              />
            </label>
          </form>

          {calendarJsonSaving && <p className="admin-form__dirty">Auto-saving JSON...</p>}
          {calendarJsonSaveError && <p className="admin-form__error">{calendarJsonSaveError}</p>}
          {calendarJsonSaveMessage && (
            <p className="admin-form__success">{calendarJsonSaveMessage}</p>
          )}
        </article>
      )}

      {activeTool === 'downloads-options' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Downloads Editor Options</h2>
            <button type="button" className="admin-form__reset" onClick={closeDownloadsEditor}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Choose how you want to edit downloads: normal form editor or direct JSON editor.
          </p>

          <section className="tiles" aria-label="Downloads edit options">
            <Tile icon="edit_note" label="Normal Edit" onClick={openDownloadsNormalEditor} />
            <Tile icon="data_object" label="JSON Edit" onClick={openDownloadsJsonEditor} />
          </section>
        </article>
      )}

      {activeTool === 'downloads-normal' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Downloads Editor</h2>
            <button type="button" className="admin-form__reset" onClick={backToDownloadsOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Manage downloadable resources. Save will update downloads data immediately.
          </p>

          <form className="admin-form" onSubmit={handleDownloadSave}>
            <div className="admin-routine-list">
              {downloadItems.map((item, index) => (
                <section key={item._uiKey || index} className="admin-routine-item">
                  <div className="admin-routine-item__head">
                    <h3 className="admin-routine-item__title">Download #{index + 1}</h3>
                    <button
                      type="button"
                      className="admin-routine-item__remove"
                      onClick={() => handleRemoveDownloadItem(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="admin-routine-item__grid">
                    <label className="admin-form__field">
                      <span>Title</span>
                      <input
                        value={item.title || ''}
                        onChange={(e) => handleDownloadFieldChange(index, 'title', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Category</span>
                      <input
                        value={item.category || ''}
                        onChange={(e) =>
                          handleDownloadFieldChange(index, 'category', e.target.value)
                        }
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>File URL</span>
                      <input
                        value={item.url || ''}
                        onChange={(e) => handleDownloadFieldChange(index, 'url', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Date (YYYY-MM-DD)</span>
                      <input
                        value={item.date || ''}
                        onChange={(e) => handleDownloadFieldChange(index, 'date', e.target.value)}
                      />
                    </label>
                  </div>
                </section>
              ))}
            </div>

            <button type="button" className="admin-form__secondary" onClick={handleAddDownloadItem}>
              + Add New Download
            </button>

            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Save Downloads
              </button>
              <button type="button" className="admin-form__reset" onClick={handleDownloadReset}>
                Reset
              </button>
            </div>
          </form>

          {downloadDirty && (
            <p className="admin-form__dirty">You have unsaved downloads changes.</p>
          )}
          {downloadSaveError && <p className="admin-form__error">{downloadSaveError}</p>}
          {downloadSaveMessage && <p className="admin-form__success">{downloadSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'downloads-json' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Downloads Editor (JSON)</h2>
            <button type="button" className="admin-form__reset" onClick={backToDownloadsOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Paste downloads JSON below. When JSON is valid, it is saved automatically.
          </p>

          <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-form__field">
              <span>Downloads JSON</span>
              <textarea
                rows={18}
                value={downloadJsonText}
                onChange={handleDownloadJsonChange}
                placeholder={DOWNLOADS_JSON_PLACEHOLDER}
              />
            </label>
          </form>

          {downloadJsonSaving && <p className="admin-form__dirty">Auto-saving JSON...</p>}
          {downloadJsonSaveError && <p className="admin-form__error">{downloadJsonSaveError}</p>}
          {downloadJsonSaveMessage && (
            <p className="admin-form__success">{downloadJsonSaveMessage}</p>
          )}
        </article>
      )}

      {activeTool === 'courses-options' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">All Courses Editor Options</h2>
            <button type="button" className="admin-form__reset" onClick={closeCoursesEditor}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Choose how you want to edit all courses: normal form editor or direct JSON editor.
          </p>

          <section className="tiles" aria-label="Courses edit options">
            <Tile icon="menu_book" label="Normal Edit" onClick={openCoursesNormalEditor} />
            <Tile icon="data_object" label="JSON Edit" onClick={openCoursesJsonEditor} />
          </section>
        </article>
      )}

      {activeTool === 'courses-normal' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin All Courses Editor</h2>
            <button type="button" className="admin-form__reset" onClick={backToCourseOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Manage courses by semester. This editor follows the same semester-focused style as
            routines editor.
          </p>

          <form className="admin-form" onSubmit={handleCourseSave}>
            <label className="admin-form__field">
              <span>Semester Selector</span>
              <select
                value={selectedCourseSemesterKey}
                onChange={(event) => handleSelectCourseSemester(event.target.value)}
              >
                {courseSemesterItems.map((entry, index) => (
                  <option key={entry._uiKey} value={entry._uiKey}>
                    {entry.semester || `Semester #${index + 1}`}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-form__actions">
              <button
                type="button"
                className="admin-form__secondary"
                onClick={handleAddCourseSemester}
              >
                + Add Semester
              </button>
              <button
                type="button"
                className="admin-form__reset"
                onClick={handleRemoveCourseSemester}
              >
                Remove Semester
              </button>
            </div>

            <label className="admin-form__field">
              <span>Semester</span>
              <input
                name="courseSemester"
                value={courseSemester}
                onChange={(event) => handleCourseSemesterNameChange(event.target.value)}
              />
            </label>

            <div className="admin-routine-list">
              {courseItems.map((item, index) => (
                <section key={item._uiKey || index} className="admin-routine-item">
                  <div className="admin-routine-item__head">
                    <h3 className="admin-routine-item__title">Course #{index + 1}</h3>
                    <button
                      type="button"
                      className="admin-routine-item__remove"
                      onClick={() => handleRemoveCourseItem(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="admin-routine-item__grid">
                    <label className="admin-form__field">
                      <span>Code</span>
                      <input
                        value={item.code || ''}
                        onChange={(e) => handleCourseFieldChange(index, 'code', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Name</span>
                      <input
                        value={item.name || ''}
                        onChange={(e) => handleCourseFieldChange(index, 'name', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Type</span>
                      <input
                        value={item.type || ''}
                        onChange={(e) => handleCourseFieldChange(index, 'type', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Credits</span>
                      <input
                        value={item.credits ?? ''}
                        onChange={(e) => handleCourseFieldChange(index, 'credits', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Intake</span>
                      <input
                        value={item.intake || ''}
                        onChange={(e) => handleCourseFieldChange(index, 'intake', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Section</span>
                      <input
                        value={item.section || ''}
                        onChange={(e) => handleCourseFieldChange(index, 'section', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Result</span>
                      <input
                        value={item.result || ''}
                        onChange={(e) => handleCourseFieldChange(index, 'result', e.target.value)}
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Take As</span>
                      <input
                        value={item.takeAs || ''}
                        onChange={(e) => handleCourseFieldChange(index, 'takeAs', e.target.value)}
                      />
                    </label>
                  </div>
                </section>
              ))}
            </div>

            {courseItems.length === 0 && (
              <p className="admin-note">No courses in the selected semester.</p>
            )}

            <button type="button" className="admin-form__secondary" onClick={handleAddCourseItem}>
              + Add New Course In Semester
            </button>

            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Save All Courses
              </button>
              <button type="button" className="admin-form__reset" onClick={handleCourseReset}>
                Reset
              </button>
            </div>
          </form>

          {courseDirty && <p className="admin-form__dirty">You have unsaved course changes.</p>}
          {courseSaveError && <p className="admin-form__error">{courseSaveError}</p>}
          {courseSaveMessage && <p className="admin-form__success">{courseSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'courses-json' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin All Courses Editor (JSON)</h2>
            <button type="button" className="admin-form__reset" onClick={backToCourseOptions}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Paste all courses JSON below. When JSON is valid, it is saved automatically.
          </p>

          <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-form__field">
              <span>Courses JSON</span>
              <textarea
                rows={18}
                value={courseJsonText}
                onChange={handleCourseJsonChange}
                placeholder={COURSES_JSON_PLACEHOLDER}
              />
            </label>
          </form>

          {courseJsonSaving && <p className="admin-form__dirty">Auto-saving JSON...</p>}
          {courseJsonSaveError && <p className="admin-form__error">{courseJsonSaveError}</p>}
          {courseJsonSaveMessage && <p className="admin-form__success">{courseJsonSaveMessage}</p>}
        </article>
      )}

      {activeTool === 'pending-courses-options' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Pending Courses Editor Options</h2>
            <button type="button" className="admin-form__reset" onClick={closePendingCoursesEditor}>
              Back
            </button>
          </div>

          <p className="admin-note">
            Choose how you want to edit pending courses: normal form editor or direct JSON editor.
          </p>

          <section className="tiles" aria-label="Pending courses edit options">
            <Tile icon="edit_note" label="Normal Edit" onClick={openPendingCoursesNormalEditor} />
            <Tile icon="data_object" label="JSON Edit" onClick={openPendingCoursesJsonEditor} />
          </section>
        </article>
      )}

      {activeTool === 'pending-courses-normal' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Pending Courses Editor</h2>
            <button
              type="button"
              className="admin-form__reset"
              onClick={backToPendingCourseOptions}
            >
              Back
            </button>
          </div>

          <p className="admin-note">
            Manage pending courses. Save will update both dashboard and pending courses section
            data.
          </p>

          <form className="admin-form" onSubmit={handlePendingCourseSave}>
            <div className="admin-routine-list">
              {pendingCourseItems.map((item, index) => (
                <section key={item._uiKey || index} className="admin-routine-item">
                  <div className="admin-routine-item__head">
                    <h3 className="admin-routine-item__title">Pending Course #{index + 1}</h3>
                    <button
                      type="button"
                      className="admin-routine-item__remove"
                      onClick={() => handleRemovePendingCourseItem(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="admin-routine-item__grid">
                    <label className="admin-form__field">
                      <span>Code</span>
                      <input
                        value={item.code || ''}
                        onChange={(e) =>
                          handlePendingCourseFieldChange(index, 'code', e.target.value)
                        }
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Name</span>
                      <input
                        value={item.name || ''}
                        onChange={(e) =>
                          handlePendingCourseFieldChange(index, 'name', e.target.value)
                        }
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Credits</span>
                      <input
                        value={item.credits ?? ''}
                        onChange={(e) =>
                          handlePendingCourseFieldChange(index, 'credits', e.target.value)
                        }
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Reason</span>
                      <input
                        value={item.reason || ''}
                        onChange={(e) =>
                          handlePendingCourseFieldChange(index, 'reason', e.target.value)
                        }
                      />
                    </label>
                    <label className="admin-form__field">
                      <span>Status</span>
                      <input
                        value={item.status || ''}
                        onChange={(e) =>
                          handlePendingCourseFieldChange(index, 'status', e.target.value)
                        }
                      />
                    </label>
                  </div>
                </section>
              ))}
            </div>

            <button
              type="button"
              className="admin-form__secondary"
              onClick={handleAddPendingCourseItem}
            >
              + Add New Pending Course
            </button>

            <div className="admin-form__actions">
              <button type="submit" className="admin-form__save">
                Save Pending Courses
              </button>
              <button
                type="button"
                className="admin-form__reset"
                onClick={handlePendingCourseReset}
              >
                Reset
              </button>
            </div>
          </form>

          {pendingCourseDirty && (
            <p className="admin-form__dirty admin-form__dirty--warning">
              You have unsaved pending courses changes.
            </p>
          )}
          {pendingCourseSaveError && <p className="admin-form__error">{pendingCourseSaveError}</p>}
          {pendingCourseSaveMessage && (
            <p className="admin-form__success">{pendingCourseSaveMessage}</p>
          )}
        </article>
      )}

      {activeTool === 'pending-courses-json' && (
        <article className="semester-card">
          <div className="admin-editor__top">
            <h2 className="semester-card__term">Admin Pending Courses Editor (JSON)</h2>
            <button
              type="button"
              className="admin-form__reset"
              onClick={backToPendingCourseOptions}
            >
              Back
            </button>
          </div>

          <p className="admin-note">
            Paste pending courses JSON below. When JSON is valid, it is saved automatically.
          </p>

          <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-form__field">
              <span>Pending Courses JSON</span>
              <textarea
                rows={18}
                value={pendingCourseJsonText}
                onChange={handlePendingCourseJsonChange}
                placeholder={PENDING_COURSES_JSON_PLACEHOLDER}
              />
            </label>
          </form>

          {pendingCourseJsonSaving && <p className="admin-form__dirty">Auto-saving JSON...</p>}
          {pendingCourseJsonSaveError && (
            <p className="admin-form__error">{pendingCourseJsonSaveError}</p>
          )}
          {pendingCourseJsonSaveMessage && (
            <p className="admin-form__success">{pendingCourseJsonSaveMessage}</p>
          )}
        </article>
      )}
    </>
  );
}
