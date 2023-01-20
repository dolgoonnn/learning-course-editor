import React from "react";
import Navbar from "@components/navbar";
import Footer from "@components/footer";
import {
    Button,
    Modal,
    Space,
    Form,
    Input,
    notification,
    Select,
    Option,
    message,
    Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import {
    useCourseById,
    createChapter,
    createSubCourse,
    updateCourse,
    deleteCourseById,
} from "@lib/service";
import { useState, useMemo, useRef, useEffect } from "react";
import { getAccessToken, getRefreshToken, saveToken } from "@lib/auth";
import dynamic from "next/dynamic";
import CourseGroup from "@components/modal/courseGroup";
import NewCourse from "@components/modal/newCourse";
import Breadcrumb from "@components/molecule/breadcrumb";
import LeftMenu from "@components/molecule/LeftMenu";
import SERVER_SETTINGS from "@lib/serverSettings";
import { Editor } from "@tinymce/tinymce-react";
import Image from "next/image";

const QuillNoSSRWrapper = dynamic(import("react-quill"), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
});

// const modules = {
//     toolbar: [
//         [{ header: "1" }, { header: "2" }, { font: [] }],
//         [{ size: [] }],
//         ["bold", "italic", "underline", "strike", "blockquote"],
//         [
//             { list: "ordered" },
//             { list: "bullet" },
//             { indent: "-1" },
//             { indent: "+1" },
//         ],
//         ["link", "image", "video", "code-block"],
//         ["clean"],
//     ],

//     clipboard: {
//         // toggle to add extra line breaks when pasting HTML:
//         matchVisual: false,
//     },
//     handlers: {
//         image: imageHandler,
//     },
// };

export default function Detail() {
    const router = useRouter();
    const id = +router.query.id;
    const [editMode, setEditMode] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenGroup, setIsModalOpenGroup] = useState(false);
    const [headerImage, setHeaderImage] = useState([]);
    //todo hereggui state
    const [selectedOption, setSelectedOption] = useState();

    const { data: course, loading: courseLoading } = useCourseById(id);

    const [title, setTitle] = useState(course?.course?.courseName);
    const [desc, setDesc] = useState(course?.course?.courseDescription);
    const [subDesc, setSubDesc] = useState(
        course?.course?.courseSubDescription
    );
    const [headerImageUrl, setHeaderImageUrl] = useState(
        course?.course?.courseThumbNailUrl
    );

    const [headerBannerUrl, setHeaderBannerUrl] = useState(
        course?.course?.courseCoverUrl
    );
    const [form] = Form.useForm();
    const editorRef = useRef(null);

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const openNotificationWithIcon = (type, data) => {
        notification[type]({
            message: type === "success" ? "success" : "error",
            description: data,
        });
    };

    const onFinish = async (values) => {
        var object = {
            chapter: values.chapter,
            subCourseName: values.subCourseName,
            courseId: id,
        };
        // setSubLessons([...subLessons, values]);
        const { data, status } = await createSubCourse(object);

        if (status === 200) {
            openNotificationWithIcon(
                "success",
                "Successfully created sub course!"
            );
            form.resetFields();
        } else {
            openNotificationWithIcon(
                "error",
                data?.message || "Failed to create sub course!"
            );
            // setLoading(false);
        }
    };

    const save = async () => {
        var object = {
            courseName: title,
            courseDescription: editorRef.current.getContent(),
            courseThumbNailUrl: headerImageUrl,
            courseCoverUrl: headerBannerUrl,
        };
        const { data, status } = await updateCourse(id, object);
        if (status === 200) {
            openNotificationWithIcon("success", "Successfully updated course!");

            setEditMode(false);
        } else {
            openNotificationWithIcon(
                "error",
                data?.message || "Failed to update course!"
            );
            // setLoading(false);
        }
    };

    const deleteCourse = async () => {
        const { data, status } = await deleteCourseById(id);

        openNotificationWithIcon("success", "Successfully deleted course!");
        router.push("/");
        // if (status === 200) {
        // } else {
        //     openNotificationWithIcon(
        //         "error",
        //         data?.message || "Failed to delete course!"
        //     );
        //     // setLoading(false);
        // }
    };

    const addContent = (value) => {
        console.log(
            "🚀 ~ file: createCourse.js:79 ~ addContent ~ value",
            value
        );

        setDesc(value);
    };
    const showModal = () => {
        setIsModalOpen(true);
    };
    const showModalGroup = () => {
        setIsModalOpenGroup(true);
    };

    const quillRef = useRef(null);

    return (
        <div className=" bg-trueGray-900 h-screen overflow-clip">
            <div className="container mx-auto">
                <Navbar />
            </div>
            <div className="h-full ">
                <div className="h-full border-t border-trueGray-700 ">
                    <div className="h-full container mx-auto flex px-2">
                        {/* {course?.course?.courseName} */}
                        <LeftMenu
                            detail={course?.subCourses}
                            course={course?.course}
                            id={id}
                        />
                        <div className="w-full p-8 max-h-screen overflow-y-auto">
                            <Breadcrumb
                                courseName={course?.course?.courseName}
                            />

                            <div className=" pb-3">
                                {editMode ? (
                                    <input
                                        className="hs-input w-full"
                                        type="text"
                                        placeholder="Гарчиг"
                                        value={
                                            title || course?.course?.courseName
                                        }
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                    />
                                ) : (
                                    <h2 className="max-w-2xl mt-3 text-3xl font-bold leading-snug tracking-tight text-gray-800 lg:leading-tight lg:text-4xl dark:text-white">
                                        {course?.course?.courseName}
                                    </h2>
                                )}
                            </div>
                            <div className=" pb-3">
                                {editMode ? (
                                    <input
                                        className="hs-input w-full"
                                        type="text"
                                        placeholder="Богино тайлбар"
                                        value={
                                            subDesc ||
                                            course?.course?.courseSubDescription
                                        }
                                        onChange={(e) =>
                                            setSubDesc(e.target.value)
                                        }
                                    />
                                ) : (
                                    <p className="max-w-2xl mt-3 text-3xl font-bold leading-snug tracking-tight text-gray-800 lg:leading-tight lg:text-4xl dark:text-white">
                                        {course?.course?.courseSubDescription}
                                    </p>
                                )}
                            </div>
                            <div className=" pb-3">
                                {editMode ? (
                                    <div className="w-full">
                                        Header Image
                                        <input
                                            className="hs-input mt-3 w-full"
                                            type="text"
                                            placeholder="Thumbnail image URL"
                                            value={headerImageUrl}
                                            onChange={(e) =>
                                                setHeaderImageUrl(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        Header Image
                                        <div className="h-[130px] w-full">
                                            <Image
                                                src={
                                                    course?.course
                                                        ?.courseThumbNailUrl ||
                                                    "https://source.unsplash.com/random/300x300/?2"
                                                }
                                                height={130}
                                                width={300}
                                                alt="Cover"
                                                // priority="true"
                                                className="object-cover rounded-xl max-h-full w-full shadow-lg"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className=" pb-3">
                                {editMode ? (
                                    <input
                                        className="hs-input mt-3 w-full"
                                        type="text"
                                        placeholder="Banner image URL"
                                        value={headerBannerUrl}
                                        onChange={(e) =>
                                            setHeaderBannerUrl(e.target.value)
                                        }
                                    />
                                ) : (
                                    <div className="w-full">
                                        Banner Image
                                        <div className="h-[260px] w-full mt-3 ">
                                            <Image
                                                src={
                                                    course?.course
                                                        ?.courseCoverUrl ||
                                                    "https://source.unsplash.com/random/300x300/?2"
                                                }
                                                height={260}
                                                width={300}
                                                alt="Cover"
                                                // priority="true"
                                                className="object-cover rounded-xl max-h-full w-full shadow-lg"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3">
                                {editMode ? (
                                    <Editor
                                        apiKey="6txtqjyoakt14laf9nspotnfhh3a39axurq82x8ego0yq4h1"
                                        onInit={(evt, editor) =>
                                            (editorRef.current = editor)
                                        }
                                        initialValue={
                                            desc ||
                                            course?.course?.courseDescription
                                        }
                                        init={{
                                            height: 500,
                                            menubar: false,
                                            plugins: [
                                                "advlist",
                                                "autolink",
                                                "lists",
                                                "link",
                                                "image",
                                                "charmap",
                                                "preview",
                                                "anchor",
                                                "searchreplace",
                                                "visualblocks",
                                                "code",
                                                "fullscreen",
                                                "insertdatetime",
                                                "media",
                                                "table",
                                                "code",
                                                "help",
                                                "wordcount",
                                                "codesample",
                                                "code",
                                            ],
                                            codesample_languages: [
                                                {
                                                    text: "HTML/XML",
                                                    value: "markup",
                                                },
                                                {
                                                    text: "JavaScript",
                                                    value: "javascript",
                                                },
                                                { text: "CSS", value: "css" },
                                                { text: "PHP", value: "php" },
                                                { text: "Ruby", value: "ruby" },
                                                {
                                                    text: "Python",
                                                    value: "python",
                                                },
                                                { text: "Java", value: "java" },
                                                { text: "C", value: "c" },
                                                { text: "C#", value: "csharp" },
                                                { text: "C++", value: "cpp" },
                                            ],
                                            toolbar:
                                                "undo redo | blocks | " +
                                                "bold italic forecolor | alignleft aligncenter " +
                                                "alignright alignjustify | bullist numlist outdent indent | " +
                                                "removeformat | help |" +
                                                "codesample " +
                                                "image",
                                            content_style:
                                                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                        }}
                                    />
                                ) : (
                                    <p>{course?.course?.courseDescription}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-trueGray-900  border-t border-trueGray-700 bottom-0 fixed w-full h-16 flex ">
                    <div className="container mx-auto flex  px-2">
                        <div className="justify-start flex">
                            <div className="flex w-80 border-r border-trueGray-700">
                                <div className="my-auto flex space-x-4">
                                    {" "}
                                    <Button
                                        type="primary"
                                        className="hs-btn hs-btn-primary  "
                                        onClick={showModal}
                                    >
                                        Add sub-lesson
                                    </Button>
                                    <Button
                                        type="default"
                                        className="hs-btn hs-btn-default "
                                        onClick={showModalGroup}
                                    >
                                        Group
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full justify-end">
                            {editMode ? (
                                <Space>
                                    <Button
                                        type="primary"
                                        className="hs-btn hs-btn-primary my-auto "
                                        onClick={() => save()}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        type="default"
                                        className="hs-btn hs-btn-default my-auto "
                                        onClick={() => setEditMode(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Space>
                            ) : (
                                <Space className="justify-between">
                                    <Button
                                        type="primary"
                                        className="hs-btn hs-btn-primary my-auto "
                                        onClick={() => setEditMode(true)}
                                    >
                                        Edit{" "}
                                    </Button>
                                    <Button
                                        type="default"
                                        className="hs-btn hs-btn-text my-auto "
                                        onClick={() => deleteCourse()}
                                    >
                                        Delete this course
                                    </Button>
                                </Space>
                            )}
                        </div>
                    </div>
                </div>
            </div>{" "}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                className="hs-modal"
                footer={null}
            >
                <Space className="w-full" direction="vertical" size={16}>
                    <h5>Шинэ course-ийн гарчиг</h5>
                    <Form
                        className="hs-row"
                        form={form}
                        layout="vertical"
                        requiredMark={true}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Space
                            className="w-full"
                            direction="vertical"
                            size={16}
                        >
                            <Form.Item
                                name="subCourseName"
                                className="hs-form-item"
                                rules={[
                                    {
                                        required: true,
                                        message: "Enter Title",
                                    },
                                ]}
                                required
                            >
                                <Input
                                    className="hs-input"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="ERC 20 ..."
                                />
                            </Form.Item>
                            <h5>Бүлэг сонгох</h5>
                            <Form.Item
                                name="chapter"
                                className="hs-form-item"
                                rules={[
                                    {
                                        required: true,
                                        message: "Enter Chapter",
                                    },
                                ]}
                                required
                            >
                                <select
                                    value={selectedOption}
                                    onChange={handleChange}
                                    placeholder="select"
                                    className=" hs-input-custom w-full px-4"
                                >
                                    <option value="⬇️ Select a chapters ⬇️">
                                        {" "}
                                        -- Select a chapter --{" "}
                                    </option>
                                    {course?.course?.courseChapter?.map(
                                        (item, index) => (
                                            <option key={index} value={item}>
                                                {item}
                                            </option>
                                        )
                                    )}
                                </select>
                                {/* <Select
                                placeholder="Select group"
                                className="hs-modal"
                                option={course?.course?.courseChapter}
                            >
                                <Option value="⬇️ Select a chapters ⬇️">
                                    {" "}
                                    -- Select a chapter --{" "}
                                </Option>
                                {course?.course?.courseChapter.map(
                                    (item, index) => (
                                        <Option key={index} label={item}>
                                            {item}
                                        </Option>
                                    )
                                )}
                            </Select> */}
                            </Form.Item>
                            <Form.Item className="hs-form-item">
                                <Button
                                    type="primary"
                                    className="hs-btn hs-btn-primary"
                                    htmlType="submit"
                                    block
                                >
                                    Create
                                </Button>
                            </Form.Item>
                        </Space>
                    </Form>
                </Space>
            </Modal>
            <CourseGroup
                visible={isModalOpenGroup}
                setVisible={() => setIsModalOpenGroup(false)}
                course={course}
                id={id}
                // subCourseId={subCourseId}
            />
            <NewCourse
                visible={isModalOpen}
                setVisible={() => setIsModalOpen(false)}
                course={course}
                id={id}
            />
        </div>
    );
}
