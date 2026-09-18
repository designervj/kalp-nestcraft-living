import { NextRequest, NextResponse } from "next/server";
import { getPageModel } from "@/models";
import { ObjectId } from "mongodb";

function pageFilter(id: string) {
  return { _id: ObjectId.isValid(id) ? { $in: [new ObjectId(id), id] } : id };
}

function setByPath(target: any, fieldPath: string, value: string) {
  const parts = fieldPath.split(".");
  let obj = target;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    if (!obj[part]) obj[part] = /^\d+$/.test(nextPart) ? [] : {};
    obj = obj[part];
  }

  obj[parts[parts.length - 1]] = value;
}

function getFieldPaths(section: any, fieldPath: string) {
  const paths = new Set<string>();

  if (fieldPath.startsWith("content.") && section.content && !Array.isArray(section.content)) {
    paths.add(fieldPath.replace(/^content\./, "content.items."));
    if (section.props?.legacyEditor) {
      paths.add(`props.legacyEditor.${fieldPath}`);
    }
  } else {
    paths.add(fieldPath);
  }

  if (fieldPath.startsWith("props.") && section.props?.legacyEditor?.props) {
    paths.add(`props.legacyEditor.${fieldPath}`);
  }

  return Array.from(paths);
}

function setEditableFieldAtPath(section: any, fieldPath: string, value: string) {
  setByPath(section, fieldPath, value);

  const parts = fieldPath.split(".");
  const locale = parts[parts.length - 1];
  if (!locale || locale.length !== 2) return;

  let parent = section;
  for (let i = 0; i < parts.length - 2; i++) {
    parent = parent?.[parts[i]];
  }

  const fieldKey = parts[parts.length - 2];
  const field = parent?.[fieldKey];
  if (field && typeof field === "object" && "value" in field) {
    if (!field.value || typeof field.value !== "object") field.value = {};
    field.value[locale] = value;
  }
}

function setEditableField(section: any, fieldPath: string, value: string) {
  for (const path of getFieldPaths(section, fieldPath)) {
    setEditableFieldAtPath(section, path, value);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { sectionId, fieldPath, value } = await req.json();

    if (!sectionId || !fieldPath || typeof value !== "string") {
      return NextResponse.json(
        { success: false, message: "sectionId, fieldPath, and value are required" },
        { status: 400 },
      );
    }

    const PageModel = await getPageModel();
    const page = await PageModel.findOne(pageFilter(id) as any);

    if (!page || !Array.isArray(page.content)) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );
    }

    const sectionIndex = page.content.findIndex((section: any) => section?.id === sectionId);
    if (sectionIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 },
      );
    }

    const content = JSON.parse(JSON.stringify(page.content));
    setEditableField(content[sectionIndex], fieldPath, value);

    const updatedAt = new Date();
    const result = await PageModel.updateOne(
      pageFilter(id) as any,
      { $set: { content, updatedAt } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );
    }

    const savedPage = await PageModel.findOne(pageFilter(id) as any);
    return NextResponse.json({ success: true, page: savedPage });
  } catch (error) {
    console.error("Error updating page field:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update page field" },
      { status: 500 },
    );
  }
}
