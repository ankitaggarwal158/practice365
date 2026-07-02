import * as noteRepository from "./note.repository.js";

export async function searchNotes(firmId: string, query: string, limit = 20) {
  return noteRepository.findAll(firmId, { search: query, limit });
}
